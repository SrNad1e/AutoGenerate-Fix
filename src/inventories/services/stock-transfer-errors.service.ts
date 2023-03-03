import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { VerifiedProductTransferErrorInput } from '../dtos/verifiedProductTransferError.input';
import { DocumentTypeStockHistory } from '../dtos/create-stockHistory-input';
import { CreateStockTransferError } from '../dtos/create-stockTransferError.input';
import { FiltersStockTransfersErrorInput } from '../dtos/filters-stockTransfersError.input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import {
	StatusDetailTransferError,
	StockTransferError,
} from '../entities/stock-trasnsfer-error.entity';
import { StockHistoryService } from './stock-history.service';

const populate = [
	{
		path: 'stockTransfer',
		model: StockTransfer.name,
	},
];

@Injectable()
export class StockTransferErrorsService {
	constructor(
		@InjectModel(StockTransferError.name)
		private readonly stockTransferErrorModel: PaginateModel<StockTransferError>,
		@InjectModel(StockTransfer.name)
		private readonly stockTransferModel: PaginateModel<StockTransfer>,
		private readonly stockHistoryService: StockHistoryService,
	) {}

	async findAll(
		{ limit = 10, page = 1, verifield, sort }: FiltersStockTransfersErrorInput,
		user: User,
	) {
		const filters: FilterQuery<StockTransferError> = {};

		if (verifield !== undefined) {
			filters.verified = verifield;
		}

		if (!['admin', 'master'].includes(user.username)) {
			filters.company = new Types.ObjectId(user.company._id);
		}

		const options = {
			limit,
			page,
			sort,
			populate,
		};

		return this.stockTransferErrorModel.paginate(filters, options);
	}

	async verified(
		{
			productId,
			returnInventory,
			stockTransferErrorId,
			reason,
		}: VerifiedProductTransferErrorInput,
		user: User,
	) {
		const stockTransferError = await this.stockTransferErrorModel
			.findById(stockTransferErrorId)
			.lean();
		if (!stockTransferError) {
			throw new BadRequestException(
				'El traslado en error que intenta actualizar no existe',
			);
		}

		const productFind = stockTransferError.details.find(
			(detail) => detail.product._id.toString() === productId,
		);

		if (!productFind) {
			throw new BadRequestException(
				'El producto no pertenece al traslado en error',
			);
		}

		if (productFind.status === StatusDetailTransferError.CONFIRMED) {
			throw new BadRequestException('El producto ya se encuentra verificado');
		}

		const stockTransfer = await this.stockTransferModel
			.findById(stockTransferError.stockTransfer)
			.lean();

		if (returnInventory) {
			await this.stockHistoryService.addStock(
				{
					details: [
						{
							productId: productFind.product._id.toString(),
							quantity: productFind.quantity,
						},
					],
					documentId: stockTransfer._id.toString(),
					documentType: DocumentTypeStockHistory.TRANSFER,
					warehouseId: stockTransfer.warehouseOrigin._id.toString(),
				},
				user,
				stockTransfer.company._id.toString(),
			);
		} else {
			if (productFind.status === StatusDetailTransferError.SURPLUS) {
				await this.stockHistoryService.deleteStock(
					{
						details: [
							{
								productId: productFind.product._id.toString(),
								quantity: productFind.quantity,
							},
						],
						documentId: stockTransfer._id.toString(),
						documentType: DocumentTypeStockHistory.TRANSFER,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
					},
					user,
					stockTransfer.company._id.toString(),
				);
			}

			await this.stockHistoryService.addStock(
				{
					details: [
						{
							productId: productFind.product._id.toString(),
							quantity: productFind.quantity,
						},
					],
					documentId: stockTransfer._id.toString(),
					documentType: DocumentTypeStockHistory.TRANSFER,
					warehouseId: stockTransfer.warehouseDestination._id.toString(),
				},
				user,
				stockTransfer.company._id.toString(),
			);
		}

		const productsPending = stockTransferError.details.filter(
			(detail) => detail.status !== StatusDetailTransferError.CONFIRMED,
		);

		let verified = false;
		if (productsPending.length === 1) {
			verified = true;
		}

		const details = stockTransferError.details.map((detail) => {
			if (detail.product._id.toString() === productId) {
				return {
					...detail,
					status: StatusDetailTransferError.CONFIRMED,
					updatedAt: new Date(),
					reason,
				};
			}

			return detail;
		});

		return this.stockTransferErrorModel.findByIdAndUpdate(
			stockTransferErrorId,
			{
				$set: {
					details,
					verified,
				},
			},
			{
				lean: true,
				new: true,
				populate,
			},
		);
	}

	async addRegister(
		{ details, stockTransferId }: CreateStockTransferError,
		user: User,
	) {
		const stockTransferError = await this.stockTransferErrorModel.findById(
			stockTransferId,
		);

		const newDetails = details.map((detail) => ({
			...detail,
			user,
			updatedAt: new Date(),
		}));

		if (stockTransferError) {
			return this.stockTransferErrorModel.findByIdAndUpdate(
				stockTransferId,
				{
					$push: {
						details: newDetails,
					},
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);
		} else {
			return this.stockTransferErrorModel.create({
				stockTransfer: new Types.ObjectId(stockTransferId),
				details: newDetails,
				company: new Types.ObjectId(user.company._id),
			});
		}
	}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { CreateStockTransferError } from '../dtos/create-stockTransferError.input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockTransferError } from '../entities/stock-trasnsfer-error.entity';

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
	) {}

	async create(
		{ details, stockTransferId }: CreateStockTransferError,
		user: User,
	) {
		const stockTransferError = await this.stockTransferErrorModel.findById(
			stockTransferId,
		);

		const newDetails = details.map((detail) => ({
			...detail,
			user,
			updateAt: new Date(),
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
			});
		}
	}
}

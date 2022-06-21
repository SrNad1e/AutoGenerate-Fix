import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { Color } from 'src/products/entities/color.entity';
import { Size } from 'src/products/entities/size.entity';
import { ProductsService } from 'src/products/services/products.service';
import { User } from 'src/configurations/entities/user.entity';

import { ConfirmStockTransferInput } from '../dtos/confirmProducts-stockTransfer.input';
import {
	CreateStockHistoryInput,
	DocumentTypeStockHistory,
} from '../dtos/create-stockHistory-input';
import { CreateStockTransferInput } from '../dtos/create-stockTransfer-input';
import { FiltersStockTransfersInput } from '../dtos/filters-stockTransfers.input';
import {
	ActionDetailTransfer,
	UpdateStockTransferInput,
} from '../dtos/update-stockTransfer-input';
import {
	StatusStockRequest,
	StockRequest,
} from '../entities/stock-request.entity';
import {
	StatusDetailTransfer,
	StatusStockTransfer,
	StockTransfer,
} from '../entities/stock-transfer.entity';
import { StockHistoryService } from './stock-history.service';
import { StockRequestService } from './stock-request.service';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';
import { WarehousesService } from 'src/configurations/services/warehouses.service';

const populate = [
	{
		path: 'details',
		populate: [
			{
				path: 'product',
				populate: [
					{
						path: 'size',
						model: Size.name,
					},
					{
						path: 'color',
						model: Color.name,
					},
					{
						path: 'stock',
						populate: [
							{
								path: 'warehouse',
								model: Warehouse.name,
							},
						],
					},
				],
			},
		],
	},
	{ path: 'requests', model: StockRequest.name },
];

@Injectable()
export class StockTransferService {
	constructor(
		@InjectModel(StockTransfer.name)
		private readonly stockTransferModel: PaginateModel<StockTransfer>,
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
		private readonly stockHistoryService: StockHistoryService,
		private readonly stockRequestService: StockRequestService,
	) {}

	async findAll(
		{
			limit = 20,
			page = 1,
			number,
			sort,
			status,
			warehouseDestinationId,
			warehouseOriginId,
			dateInitial,
			dateFinal,
		}: FiltersStockTransfersInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<StockTransfer> = {};

		try {
			if (user.username !== 'admin') {
				filters['company._id'] = new Types.ObjectId(companyId);
			}

			if (number) {
				filters.number = number;
			}

			if (StatusStockTransfer[status]) {
				filters.status = StatusStockTransfer[status];
			}

			if (warehouseDestinationId) {
				filters['warehouseDestination._id'] = new Types.ObjectId(
					warehouseDestinationId,
				);
			}

			if (warehouseOriginId) {
				filters['warehouseOrigin._id'] = new Types.ObjectId(warehouseOriginId);
			}

			const options = {
				limit,
				page,
				sort,
				lean: true,
				populate,
			};

			if (sort?.warehouseDestination) {
				options.sort['warehouseDestination.name'] = sort.warehouseDestination;
			}

			if (sort?.warehouseOrigin) {
				options.sort['warehouseOrigin.name'] = sort.warehouseOrigin;
			}
			if (dateInitial) {
				if (!dateFinal) {
					throw new BadRequestException('Debe enviarse una fecha final');
				}

				filters['createdAt'] = {
					$gte: new Date(dateInitial),
					$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
				};
			} else if (dateFinal) {
				if (!dateInitial) {
					throw new BadRequestException('Debe enviarse una fecha inicial');
				}
				filters['createdAt'] = {
					$gte: new Date(dateInitial),
					$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
				};
			}

			return this.stockTransferModel.paginate(filters, options);
		} catch (error) {
			throw new BadRequestException(`Se ha presentado un error  ${error}`);
		}
	}

	async findById(id: string) {
		try {
			const response = await this.stockTransferModel
				.findById(id)
				.populate(populate)
				.lean();
			if (response) {
				return response;
			}
			throw new NotFoundException('El traslado no existe');
		} catch (error) {
			return error;
		}
	}

	async create(
		{
			warehouseDestinationId,
			warehouseOriginId,
			details,
			requests,
			status,
			...options
		}: CreateStockTransferInput,
		user: Partial<User>,
		companyId: string,
	) {
		if (StatusStockTransfer[status]) {
			if (
				[
					StatusStockTransfer.CANCELLED,
					StatusStockTransfer.CONFIRMED,
					StatusStockTransfer.INCOMPLETE,
				].includes(StatusStockTransfer[status])
			) {
				throw new BadRequestException(
					'El traslado no puede ser creado, valide el estado del traslado',
				);
			}
		}

		if (!(details?.length > 0)) {
			throw new BadRequestException('El traslado no puede estar vacío');
		}
		if (requests) {
			const requestOpenOrCancel = await this.stockRequestService.findAllMany({
				requests,
				status: [StatusStockRequest.OPEN, StatusStockRequest.CANCELLED],
			});

			if (requestOpenOrCancel.length > 0) {
				throw new BadRequestException(
					'Una de las solicitudes se encuentra abierta o cancelada',
				);
			}
		}

		const warehouseOrigin = await this.warehousesService.findById(
			warehouseOriginId,
		);

		const warehouseDestination = await this.warehousesService.findById(
			warehouseDestinationId,
		);

		if (!warehouseOrigin?.active) {
			throw new BadRequestException(
				'La bodega de origen no existe o se encuentra inactiva',
			);
		}

		if (!warehouseDestination?.active) {
			throw new BadRequestException(
				'La bodega de destino no existe o se encuentra inactiva',
			);
		}

		const detailsTransfer = [];

		for (let i = 0; i < details.length; i++) {
			const { quantity, productId } = details[i];
			const product = await this.productsService.validateStock(
				productId,
				quantity,
				warehouseOriginId,
			);
			detailsTransfer.push({
				product,
				quantity,
				status: StatusDetailTransfer.NEW,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		const stockTransfer = await this.stockTransferModel
			.findOne({ 'company._id': new Types.ObjectId(companyId) })
			.sort({ _id: -1 });

		const newStockTransfer = new this.stockTransferModel({
			...options,
			status: StatusStockTransfer[status],
			warehouseOrigin,
			warehouseDestination,
			details: detailsTransfer,
			userOrigin: user,
			company: user.companies.find(
				(company) => company._id.toString() === companyId,
			),
			number: (stockTransfer?.number || 0) + 1,
			requests,
			user,
		});

		const response = await newStockTransfer.save();

		if (StatusStockTransfer[status] === StatusStockTransfer.SENT) {
			await this.stockRequestService.updateMany({
				requests,
				status: StatusStockRequest.USED,
			});
			const detailHistory = response.details.map((detail) => ({
				productId: detail.product._id.toString(),
				quantity: detail.quantity,
			}));
			if (detailHistory?.length > 0) {
				const deleteStockHistoryInput: CreateStockHistoryInput = {
					details: detailHistory,
					warehouseId: warehouseOriginId,
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.TRANSFER,
				};
				await this.stockHistoryService.deleteStock(
					deleteStockHistoryInput,
					user,
					companyId,
				);
			}
		}

		return response.populate(populate);
	}

	async update(
		id: string,
		{
			details,
			requests,
			observationOrigin,
			status,
			...options
		}: UpdateStockTransferInput,
		user: Partial<User>,
		companyId: string,
	) {
		const stockTransfer = await this.stockTransferModel.findById(id).lean();

		if (!stockTransfer) {
			throw new BadRequestException('El traslado no existe');
		}

		if (
			user.username !== 'admin' &&
			stockTransfer?.company?._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no se encuentra autorizado para hacer cambios en el traslado`,
			);
		}

		if (StatusStockTransfer[status]) {
			switch (stockTransfer.status) {
				case StatusStockTransfer.OPEN:
					if (
						![StatusStockTransfer.SENT, StatusStockTransfer.CANCELLED].includes(
							StatusStockTransfer[status],
						)
					) {
						throw new BadRequestException('El traslado se encuentra abierto');
					}
					break;
				case StatusStockTransfer.SENT:
					if (
						[StatusStockTransfer.OPEN, StatusStockTransfer.CANCELLED].includes(
							StatusStockTransfer[status],
						)
					) {
						throw new BadRequestException(
							'El traslado ya se encuentra enviado',
						);
					}
					break;
				case StatusStockTransfer.CONFIRMED ||
					StatusStockTransfer.INCOMPLETE ||
					StatusStockTransfer.VERIFIED ||
					StatusStockTransfer.CANCELLED:
					throw new BadRequestException(
						'El traslado ya se encuentra finalizado',
					);

				default:
					throw new BadRequestException('El estado es incorrecto');
			}
			if (StatusStockTransfer[status] === stockTransfer.status) {
				throw new BadRequestException(
					'El estado del traslado debe cambiar o enviarse vacío',
				);
			}
		}

		if (
			stockTransfer.status !== StatusStockTransfer.OPEN &&
			!StatusStockTransfer[status]
		) {
			throw new BadRequestException('Debe enviar un cambio de estado');
		}

		if (requests) {
			const requestOpenOrCancel = await this.stockRequestService.findAllMany({
				requests,
				status: [StatusStockRequest.OPEN, StatusStockRequest.CANCELLED],
			});

			if (requestOpenOrCancel.length > 0) {
				throw new BadRequestException(
					'Una de las solicitudes se encuentra abierta o cancelada',
				);
			}
		}

		if (details && details.length > 0) {
			const productsDelete = details
				.filter(
					(detail) =>
						ActionDetailTransfer[detail.action] === ActionDetailTransfer.DELETE,
				)
				.map((detail) => detail.productId.toString());

			const newDetails = stockTransfer.details.filter(
				(detail) => !productsDelete.includes(detail.product._id.toString()),
			);

			for (let i = 0; i < details.length; i++) {
				const { action, productId, quantity } = details[i];

				if (ActionDetailTransfer[action] === ActionDetailTransfer.CREATE) {
					const productFind = stockTransfer.details.find(
						(item) => item.product._id.toString() === productId.toString(),
					);
					if (productFind) {
						throw new BadRequestException(
							`El producto ${productFind.product.reference['name']} / ${productFind.product.barcode} ya se encuentra registrado`,
						);
					}
					const product = await this.productsService.findById(
						productId,
						stockTransfer?.warehouseOrigin?._id.toString(),
					);
					newDetails.push({
						product,
						quantity,
						status: StatusDetailTransfer.NEW,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}

				if (ActionDetailTransfer[action] === ActionDetailTransfer.UPDATE) {
					const indexFind = newDetails.findIndex(
						(item) => item.product?._id.toString() === productId,
					);
					const product = await this.productsService.findById(
						productId,
						stockTransfer?.warehouseOrigin?._id.toString(),
					);

					newDetails[indexFind] = {
						...newDetails[indexFind],
						quantity,
						product,
					};
				}
			}

			const response = await this.stockTransferModel.findByIdAndUpdate(
				id,
				{
					$set: {
						...options,
						status: StatusStockTransfer[status],
						details: newDetails,
						requests: requests?.map((request) => new Types.ObjectId(request)),
						observationOrigin,
						user,
					},
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);

			if (StatusStockTransfer[status] === StatusStockTransfer.SENT) {
				await this.stockRequestService.updateMany({
					requests,
					status: StatusStockRequest.USED,
				});

				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
						documentId: response._id.toString(),
						documentType: DocumentTypeStockHistory.TRANSFER,
					};

					await this.stockHistoryService.deleteStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}
			}

			if (StatusStockTransfer[status] === StatusStockTransfer.CONFIRMED) {
				const confirmedProducts = stockTransfer.details.find(
					(detail) => detail.status === StatusDetailTransfer.NEW,
				);
				if (confirmedProducts) {
					throw new BadRequestException(
						'Debe confirmar todos los productos para confirmar el traslado',
					);
				}

				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantityConfirmed,
				}));

				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseDestination._id.toString(),
						documentId: response._id.toString(),
						documentType: DocumentTypeStockHistory.TRANSFER,
					};
					await this.stockHistoryService.addStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}
			}

			return response;
		} else {
			const response = await this.stockTransferModel.findByIdAndUpdate(
				id,
				{
					$set: { ...options, status: StatusStockTransfer[status], user },
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);
			if (StatusStockTransfer[status] === StatusStockTransfer.SENT) {
				await this.stockRequestService.updateMany({
					requests,
					status: StatusStockRequest.USED,
				});
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));
				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
						documentId: response._id.toString(),
						documentType: DocumentTypeStockHistory.TRANSFER,
					};
					await this.stockHistoryService.deleteStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}
			}

			if (StatusStockTransfer[status] === StatusStockTransfer.CONFIRMED) {
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantityConfirmed,
				}));
				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseDestination._id.toString(),
						documentId: response._id.toString(),
						documentType: DocumentTypeStockHistory.TRANSFER,
					};
					await this.stockHistoryService.addStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}
			}

			return response;
		}
	}

	async confirmDetail(
		id: string,
		{ details }: ConfirmStockTransferInput,
		user: User,
		companyId: string,
	) {
		const stockTransfer = await this.stockTransferModel.findById(id).lean();

		if (!stockTransfer) {
			throw new BadRequestException('El traslado no existe');
		}

		if (
			user.username !== 'admin' &&
			stockTransfer?.company?._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no se encuentra autorizado para hacer cambios en el traslado`,
			);
		}

		if (stockTransfer.status !== StatusStockTransfer.SENT) {
			throw new BadRequestException('El traslado no se encuentra enviado');
		}

		const detailsArray = stockTransfer.details
			.filter(
				(detail) =>
					detail.status === StatusDetailTransfer.CONFIRMED &&
					detail?.quantityConfirmed > 0,
			)
			.map((detail) => detail.product._id.toString());

		const detailsVerified = details.find((detail) =>
			detailsArray.includes(detail.productId),
		);
		if (detailsVerified) {
			throw new BadRequestException(
				`El producto ${detailsVerified.productId} ya se encuentra confirmado`,
			);
		}

		let newDetails = [...stockTransfer.details];

		for (let i = 0; i < details.length; i++) {
			const detailConfirm = details[i];

			const detailVerified = stockTransfer.details.find(
				(detail) =>
					detail.product._id.toString() === detailConfirm.productId.toString(),
			);

			if (!detailVerified) {
				throw new BadRequestException(
					`El producto ${detailConfirm.productId} no existe en el traslado`,
				);
			}

			newDetails = newDetails.map((detail) => {
				if (detail.product._id.toString() === detailConfirm.productId) {
					return {
						...detail,
						status: StatusDetailTransfer.CONFIRMED,
						quantityConfirmed: detailConfirm.quantity,
					};
				}

				return detail;
			});
		}

		return this.stockTransferModel.findByIdAndUpdate(
			id,
			{
				$set: { details: newDetails, user },
			},
			{ new: true, lean: true, populate },
		);
	}
}

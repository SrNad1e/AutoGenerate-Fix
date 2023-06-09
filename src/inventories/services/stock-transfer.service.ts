import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	Inject,
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
import { StatusDetailTransferError } from '../entities/stock-trasnsfer-error.entity';
import { StockTransferErrorsService } from './stock-transfer-errors.service';
import { DetailsStockTransferErrorCreateInput } from '../dtos/create-stockTransferError.input';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

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
		private readonly stockTransferErrorsService: StockTransferErrorsService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
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
			if (user.username !== this.configService.USER_ADMIN) {
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
			userOrigin: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			company: user.company,
			number: (stockTransfer?.number || 0) + 1,
			requests,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
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
		user: User,
		companyId: string,
	) {
		const stockTransfer = await this.stockTransferModel.findById(id).lean();

		if (!stockTransfer) {
			throw new BadRequestException('El traslado no existe');
		}

		if (
			user.username !== this.configService.USER_ADMIN &&
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

			let newDetails = stockTransfer.details.filter(
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

			if (StatusStockTransfer[status] === StatusStockTransfer.SENT) {
				await this.stockRequestService.updateMany({
					requests,
					status: StatusStockRequest.USED,
				});

				const detailHistory = newDetails.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
						documentId: id,
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
				const confirmedProducts = stockTransfer.details
					.filter((detail) => detail.status === StatusDetailTransfer.NEW)
					.map((detail) => detail.product._id);

				if (confirmedProducts) {
					newDetails = newDetails.map((detail) => {
						if (confirmedProducts.includes(detail.product._id)) {
							return {
								...detail,
								quantityConfirmed: 0,
							};
						}

						return detail;
					});
				}

				let detailHistory = newDetails.map((detail) => {
					if (detail.quantity <= detail.quantityConfirmed) {
						return {
							productId: detail.product._id.toString(),
							quantity: detail.quantity,
						};
					}
					return {
						productId: detail.product._id.toString(),
						quantity: detail.quantityConfirmed,
					};
				});

				detailHistory = detailHistory.filter((item) => item.quantity > 0);

				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseDestination._id.toString(),
						documentId: id,
						documentType: DocumentTypeStockHistory.TRANSFER,
					};
					await this.stockHistoryService.addStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);

					const detailsError = stockTransfer.details.filter(
						(detail) => detail.quantity !== detail.quantityConfirmed /*&&
							detail.status === StatusDetailTransfer.CONFIRMED,*/,
					);

					if (detailsError.length > 0) {
						const detailsErrorFormat = detailsError.map((detail) => {
							const newQuantity =
								detail.quantity - (detail.quantityConfirmed || 0);

							if (newQuantity > 0) {
								return {
									product: detail.product,
									quantity: newQuantity,
									status: StatusDetailTransferError.MISSING,
								};
							} else {
								return {
									product: detail.product,
									quantity: -newQuantity,
									status: StatusDetailTransferError.SURPLUS,
								};
							}
						});

						await this.stockTransferErrorsService.addRegister(
							{
								details:
									detailsErrorFormat as DetailsStockTransferErrorCreateInput[],
								stockTransferId: stockTransfer._id.toString(),
							},
							user,
						);
					}
				}
			}

			if (newDetails.length === 0) {
				throw new BadRequestException('El traslado no puede estar vacío');
			}

			return this.stockTransferModel.findByIdAndUpdate(
				id,
				{
					$set: {
						...options,
						status: StatusStockTransfer[status],
						details: newDetails,
						requests: requests?.map((request) => new Types.ObjectId(request)),
						observationOrigin,
						userDestination: {
							username: user.username,
							name: user.name,
							_id: user._id,
						},
						user: {
							username: user.username,
							name: user.name,
							_id: user._id,
						},
					},
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);
		} else {
			if (StatusStockTransfer[status] === StatusStockTransfer.SENT) {
				await this.stockRequestService.updateMany({
					requests,
					status: StatusStockRequest.USED,
				});

				const detailHistory = stockTransfer?.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
						documentId: id,
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
				let detailHistory = stockTransfer?.details.map((detail) => {
					if (detail.quantity <= (detail.quantityConfirmed || 0)) {
						return {
							productId: detail.product._id.toString(),
							quantity: detail.quantity,
						};
					}
					return {
						productId: detail.product._id.toString(),
						quantity: detail.quantityConfirmed || 0,
					};
				});

				detailHistory = detailHistory.filter((item) => item.quantity > 0);

				if (detailHistory?.length > 0) {
					const deleteStockHistoryInput: CreateStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseDestination._id.toString(),
						documentId: id,
						documentType: DocumentTypeStockHistory.TRANSFER,
					};
					await this.stockHistoryService.addStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}

				const detailsError = stockTransfer.details.filter(
					(detail) => detail.quantity !== detail.quantityConfirmed /*&&
						detail.status === StatusDetailTransfer.CONFIRMED,*/,
				);

				if (detailsError.length > 0) {
					const detailsErrorFormat = detailsError.map((detail) => {
						const newQuantity =
							detail.quantity - (detail.quantityConfirmed || 0);

						if (newQuantity > 0) {
							return {
								product: detail.product,
								quantity: newQuantity,
								status: StatusDetailTransferError.MISSING,
							};
						} else {
							return {
								product: detail.product,
								quantity: -newQuantity,
								status: StatusDetailTransferError.SURPLUS,
							};
						}
					});

					await this.stockTransferErrorsService.addRegister(
						{
							details:
								detailsErrorFormat as DetailsStockTransferErrorCreateInput[],
							stockTransferId: stockTransfer._id.toString(),
						},
						user,
					);
				}
			}

			return this.stockTransferModel.findByIdAndUpdate(
				id,
				{
					$set: {
						...options,
						observationOrigin,
						status: StatusStockTransfer[status],
						userDestination: {
							username: user.username,
							name: user.name,
							_id: user._id,
						},
						user: {
							username: user.username,
							name: user.name,
							_id: user._id,
						},
					},
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);
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
			user.username !== this.configService.USER_ADMIN &&
			stockTransfer?.company?._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no se encuentra autorizado para hacer cambios en el traslado`,
			);
		}

		if (stockTransfer.status !== StatusStockTransfer.SENT) {
			throw new BadRequestException('El traslado no se encuentra enviado');
		}

		/*const detailsArray = stockTransfer.details
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
		}*/

		let newDetails = [...stockTransfer.details];

		for (let i = 0; i < details.length; i++) {
			const detailConfirm = details[i];

			const detailVerified = stockTransfer.details.find(
				(detail) =>
					detail.product._id.toString() === detailConfirm.productId.toString(),
			);

			if (!detailVerified) {
				const product = await this.productsService.findById(
					detailConfirm.productId.toString(),
				);

				if (!product) {
					throw new BadRequestException(
						`El producto ${detailConfirm.productId.toString()} no existe`,
					);
				}

				newDetails.push({
					product,
					quantity: 0,
					status: StatusDetailTransfer.CONFIRMED,
					quantityConfirmed: detailConfirm.quantity,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			} else {
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

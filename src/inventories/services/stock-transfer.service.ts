import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PaginateModel, Types } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { AddStockHistoryInput } from '../dtos/add-stockHistory-input';
import { CreateStockTransferInput } from '../dtos/create-stockTransfer-input';
import { DeleteStockHistoryInput } from '../dtos/delete-stockHistory-input';
import { FiltersStockTransferInput } from '../dtos/filters-stockTransfer.input';
import {
	DetailStockTransferInput,
	UpdateStockTransferInput,
} from '../dtos/update-stockTransfer-input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockHistoryService } from './stock-history.service';
import { StockRequestService } from './stock-request.service';

const populate = [
	{
		path: 'details',
		populate: [
			{
				path: 'product',
				populate: [
					{
						path: 'size',
						model: 'Size',
					},
					{
						path: 'color',
						model: 'Color',
					},
					{
						path: 'stock',
						populate: [
							{
								path: 'warehouse',
								model: 'Warehouse',
							},
						],
					},
				],
			},
		],
	},
	{ path: 'requests', model: 'StockRequest' },
];

const statusTypes = ['open', 'cancelled', 'sent', 'confirmed', 'incomplete'];

@Injectable()
export class StockTransferService {
	constructor(
		@InjectModel(StockTransfer.name)
		private readonly stockTransferModel: Model<StockTransfer> &
			PaginateModel<StockTransfer>,
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
		private readonly stockHistoryService: StockHistoryService,
		private readonly stockRequestService: StockRequestService,
	) {}

	async findAll({
		limit = 20,
		page = 1,
		number,
		sort,
		status,
		warehouseDestinationId,
		warehouseOriginId,
	}: FiltersStockTransferInput) {
		const filters: FilterQuery<StockTransfer> = {};

		if (number) {
			filters.number = number;
		}

		if (status) {
			filters.status = status;
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

		return this.stockTransferModel.paginate(filters, options);
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
			...options
		}: CreateStockTransferInput,
		userOrigin: Partial<User>,
	) {
		try {
			if (!(details?.length > 0)) {
				throw new BadRequestException('La solicitud no puede estar vacía');
			}

			if (options.status) {
				if (!statusTypes.includes(options.status)) {
					throw new BadRequestException(
						`Es estado ${options.status} no es un estado válido`,
					);
				}

				if (['cancelled', 'confirmed', 'incomplete'].includes(options.status)) {
					throw new BadRequestException(
						'El traslado no puede ser creado, valide el estado del traslado',
					);
				}
			}

			if (requests) {
				const requestOpenOrCancel = await this.stockRequestService.findAllMany({
					requests,
					status: ['open', 'cancelled'],
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
					status: 'new',
					createdAt: new Date(),
					updateAt: new Date(),
				});
			}

			const newStockTransfer = new this.stockTransferModel({
				warehouseOrigin,
				warehouseDestination,
				details: detailsTransfer,
				userOrigin,
				requests,
				...options,
			});

			const response = await (await newStockTransfer.save()).populate(populate);

			if (options.status === 'sent') {
				await this.stockRequestService.updateMany({ requests, status: 'used' });
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const deleteStockHistoryInput: DeleteStockHistoryInput = {
					details: detailHistory,
					warehouseId: warehouseOriginId,
					documentId: response._id.toString(),
					documentType: 'transfer',
				};
				await this.stockHistoryService.deleteStock(deleteStockHistoryInput);
			}

			return response;
		} catch (error) {
			return error;
		}
	}

	async update(
		id: string,
		{
			details,
			requests,
			observationOrigin,
			...options
		}: UpdateStockTransferInput,
		user: Partial<User>,
	) {
		try {
			const stockTransfer = await this.stockTransferModel.findById(id).lean();

			if (!stockTransfer) {
				throw new BadRequestException('El traslado no existe');
			}

			if (options.status) {
				switch (stockTransfer.status) {
					case 'open':
						if (!['sent', 'cancelled'].includes(options.status)) {
							throw new BadRequestException('El traslado se encuentra abierto');
						}
						break;
					case 'sent':
						if (['open', 'cancelled'].includes(options.status)) {
							throw new BadRequestException(
								'El traslado ya se encuentra enviado',
							);
						}
						break;
					case 'confirmed' || 'incomplete' || 'verified' || 'cancelled':
						throw new BadRequestException(
							'El traslado ya se encuentra finalizado',
						);

					default:
						throw new BadRequestException('El estado es incorrecto');
				}
				if (options.status === stockTransfer.status) {
					throw new BadRequestException(
						'El estado del traslado debe cambiar o enviarse vacío',
					);
				}

				if (options.status === 'confirmed') {
					const confirmedProducts = stockTransfer.details.find(
						(detail) => detail.status === 'new',
					);
					if (confirmedProducts) {
						throw new BadRequestException(
							'Debe confirmar todos los productos para confirmar el traslado',
						);
					}
				}
			}

			if (stockTransfer.status !== 'open' && !options.status) {
				throw new BadRequestException('Debe enviar un cambio de estado');
			}

			if (requests) {
				const requestOpenOrCancel = await this.stockRequestService.findAllMany({
					requests,
					status: ['open', 'cancelled'],
				});

				if (requestOpenOrCancel.length > 0) {
					throw new BadRequestException(
						'Una de las solicitudes se encuentra abierta o cancelada',
					);
				}
			}

			if (details && details.length > 0) {
				const productsDelete = details
					.filter((detail) => detail.action === 'delete')
					.map((detail) => detail.productId.toString());

				const newDetails = stockTransfer.details
					.filter(
						(detail) => !productsDelete.includes(detail.product._id.toString()),
					)
					.map((detail) => {
						const productFind = details.find(
							(item) =>
								item.productId.toString() === detail.product._id.toString(),
						);
						if (productFind) {
							return {
								...detail,
								quantity: productFind.quantity,
								updateAt: new Date(),
							};
						}
						return detail;
					});
				for (let i = 0; i < details.length; i++) {
					const { action, productId, quantity } = details[i];

					if (action === 'create') {
						const productFind = stockTransfer.details.find(
							(item) => item.product._id.toString() === productId.toString(),
						);
						if (productFind) {
							throw new BadRequestException(
								`El producto ${productFind.product.reference} / ${productFind.product.barcode} ya se encuentra registrado`,
							);
						}
						const product = await this.productsService.findById(productId);
						newDetails.push({
							product,
							quantity,
							status: 'new',
							createdAt: new Date(),
							updateAt: new Date(),
						});
					}
				}

				const response = await this.stockTransferModel.findByIdAndUpdate(
					id,
					{
						$set: { details: newDetails, observationOrigin, ...options, user },
					},
					{
						new: true,
						lean: true,
						populate,
					},
				);

				if (options.status === 'sent') {
					await this.stockRequestService.updateMany({
						requests,
						status: 'used',
					});
					const detailHistory = response.details.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.quantity,
					}));

					const deleteStockHistoryInput: DeleteStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
						documentId: response._id.toString(),
						documentType: 'transfer',
					};
					await this.stockHistoryService.deleteStock(deleteStockHistoryInput);
				}

				if (options.status === 'confirmed') {
					const detailHistory = response.details.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.quantity,
					}));

					const deleteStockHistoryInput: AddStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseDestination._id.toString(),
						documentId: response._id.toString(),
						documentType: 'transfer',
					};
					await this.stockHistoryService.addStock(deleteStockHistoryInput);
				}

				return response;
			} else {
				const response = await this.stockTransferModel.findByIdAndUpdate(
					id,
					{
						$set: { ...options, user },
					},
					{
						new: true,
						lean: true,
						populate,
					},
				);
				if (options.status === 'sent') {
					await this.stockRequestService.updateMany({
						requests,
						status: 'used',
					});
					const detailHistory = response.details.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.quantity,
					}));

					const deleteStockHistoryInput: DeleteStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseOrigin._id.toString(),
						documentId: response._id.toString(),
						documentType: 'transfer',
					};
					await this.stockHistoryService.deleteStock(deleteStockHistoryInput);
				}

				if (options.status === 'confirmed') {
					const detailHistory = response.details.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.quantity,
					}));

					const deleteStockHistoryInput: AddStockHistoryInput = {
						details: detailHistory,
						warehouseId: stockTransfer.warehouseDestination._id.toString(),
						documentId: response._id.toString(),
						documentType: 'transfer',
					};
					await this.stockHistoryService.addStock(deleteStockHistoryInput);
				}

				return response;
			}
		} catch (error) {
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error,
				},
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async confirmDetail(id: string, detailsConfirm: DetailStockTransferInput[]) {
		try {
			const stockTransfer = await this.stockTransferModel.findById(id).lean();

			if (!stockTransfer) {
				throw new BadRequestException('El traslado no existe');
			}

			if (stockTransfer.status !== 'sent') {
				throw new BadRequestException(
					'El traslado debe estar enviado para poder confirmarlo',
				);
			}

			const detailsArray = stockTransfer.details
				.filter((detail) => detail.status === 'confirmed')
				.map((detail) => detail.product._id.toString());

			const detailsVerified = detailsConfirm.find((detail) =>
				detailsArray.includes(detail.productId),
			);
			if (detailsVerified) {
				throw new BadRequestException(
					`El producto ${detailsVerified.productId} ya se encuentra confirmado`,
				);
			}

			let newDetails = [...stockTransfer.details];

			for (let i = 0; i < detailsConfirm.length; i++) {
				const detailConfirm = detailsConfirm[i];

				const detailVerified = stockTransfer.details.find(
					(detail) =>
						detail.product._id.toString() ===
						detailConfirm.productId.toString(),
				);

				if (!detailVerified) {
					throw new BadRequestException(
						`El producto ${detailConfirm.productId} no existe en el traslado`,
					);
				}

				newDetails = newDetails.map((detail) => {
					if (
						detail.product._id.toString() === detailConfirm.productId.toString()
					) {
						return {
							...detail,
							status: 'confirm',
							quantityConfirmed: detailConfirm.quantity,
						};
					}

					return detail;
				});

				return this.stockTransferModel.findByIdAndUpdate(
					id,
					{
						$set: { details: newDetails },
					},
					{ new: true, lean: true, populate },
				);
			}
		} catch (error) {
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error,
				},
				HttpStatus.BAD_REQUEST,
			);
		}
	}
}

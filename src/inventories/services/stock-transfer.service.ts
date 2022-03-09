import {
	BadRequestException,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PaginateModel, Types } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateStockTransferInput } from '../dtos/create-stockTransfer-input';
import { FiltersStockTransferInput } from '../dtos/filters-stockTransfer.input';
import {
	DetailStockTransferInput,
	UpdateStockTransferInput,
} from '../dtos/update-stockTransfer-input';
import { StockRequest } from '../entities/stock-request.entity';
import { StockTransfer } from '../entities/stock-transfer.entity';

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
				],
			},
		],
	},
	{ path: 'requests', model: 'StockRequest' },
];

@Injectable()
export class StockTransferService {
	constructor(
		@InjectModel(StockTransfer.name)
		private readonly stockTransferModel: Model<StockTransfer> &
			PaginateModel<StockTransfer>,
		@InjectModel(StockRequest.name)
		private readonly stockRequestModel: Model<StockRequest> &
			PaginateModel<StockRequest>,
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
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
		return this.stockTransferModel.findById(id).populate(populate).lean();
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
			if (options.status) {
				if (
					!['open', 'cancelled', 'sent', 'confirmed', 'incomplete'].includes(
						options.status,
					)
				) {
					throw new BadRequestException(
						`Es estado ${options.status} no es un estado válido`,
					);
				}

				if (['cancelled', 'confirmed', 'incomplete'].includes(options.status)) {
					throw new BadRequestException(
						'Es traslado no puede ser creado, valide el estado del traslado',
					);
				}
			}

			if (requests) {
				const requestOpenOrCancel = await this.stockRequestModel.find({
					_id: { $in: requests },
					status: { $in: ['open', 'cancelled'] },
				});

				if (requestOpenOrCancel.length > 0) {
					throw new BadRequestException(
						'Una de las solicitudes se encuentra abierta o cancelada',
					);
				}
			}

			const warehouseOrigin = await this.warehousesService.findById(
				warehouseOriginId.toString(),
			);

			const warehouseDestination = await this.warehousesService.findById(
				warehouseDestinationId.toString(),
			);

			if (!warehouseOrigin.active) {
				throw new BadRequestException(
					'La bodega de origen se encuentra inactiva',
				);
			}

			if (!warehouseDestination.active) {
				throw new BadRequestException(
					'La bodega de destino se encuentra inactiva',
				);
			}

			const detailsTransfer = [];

			for (let i = 0; i < details.length; i++) {
				const detail = details[i];
				const product = await this.productsService.findById(detail.productId);
				detailsTransfer.push({
					product,
					quantity: detail.quantity,
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

			if (options.status === 'sent') {
				await this.stockRequestModel.updateMany(
					{ _id: { $in: requests } },
					{
						$set: { status: 'used' },
					},
				);

				//TODO: modificar inventario
			}
			return (await newStockTransfer.save()).populate(populate);
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
			}

			if (stockTransfer.status !== 'open') {
				if (!options.status) {
					throw new BadRequestException('Debe enviar un cambio de estado');
				}
				return this.stockRequestModel.findByIdAndUpdate(
					id,
					{
						$set: { ...options, user },
					},
					{ new: true, lean: true },
				);
			}

			if (requests) {
				const requestOpenOrCancel = await this.stockRequestModel.find({
					_id: { $in: requests },
					status: { $in: ['open', 'cancelled'] },
				});

				if (requestOpenOrCancel.length > 0) {
					throw new BadRequestException(
						'Una de las solicitudes se encuentra abierta o cancelada',
					);
				}
			}

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

			if (options.status === 'sent') {
				await this.stockRequestModel.updateMany(
					{ _id: { $in: requests } },
					{
						$set: { status: 'used' },
					},
				);
				//TODO: modificar el inventario
			}

			if (options.status === 'confirmed') {
				//TODO: modificar el inventario
			}

			return this.stockTransferModel.findByIdAndUpdate(
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

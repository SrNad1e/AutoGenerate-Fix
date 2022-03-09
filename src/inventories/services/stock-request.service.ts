import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PaginateModel, Types } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateStockRequestInput } from '../dtos/create-stockRequest-input';
import { FiltersStockRequestInput } from '../dtos/filters-stockRequest.input';
import { UpdateStockRequestInput } from '../dtos/update-stockRequest-input';
import { StockRequest } from '../entities/stock-request.entity';

const populate = {
	path: 'details',
	populate: {
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
};

@Injectable()
export class StockRequestService {
	constructor(
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
	}: FiltersStockRequestInput) {
		const filters: FilterQuery<StockRequest> = {};
		try {
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
				page: page,
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

			return this.stockRequestModel.paginate(filters, options);
		} catch (error) {
			throw new BadRequestException(`Se ha presentado un error  ${error}`);
		}
	}

	async findById(id: string) {
		try {
			const response = await this.stockRequestModel
				.findById(id)
				.populate(populate)
				.lean();
			if (response) {
				return response;
			} else {
				throw new NotFoundException('La solicitud no existe');
			}
		} catch (error) {
			return error;
		}
	}

	async create(
		{
			warehouseOriginId,
			warehouseDestinationId,
			details,
			...options
		}: CreateStockRequestInput,
		user: User,
	): Promise<StockRequest> {
		try {
			if (!(details.length > 0)) {
				throw new BadRequestException('La solicitud no puede estar vacía');
			}

			if (options.status) {
				if (
					!['open', 'cancelled', 'used', 'pending'].includes(options.status)
				) {
					throw new BadRequestException(
						`Es estado ${options.status} no es un estado válido`,
					);
				}
				if (['cancelled', 'used'].includes(options.status)) {
					throw new BadRequestException(
						'La solicitud no puede ser creada, valide el estado de la solicitud',
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

			const detailsRequest = [];

			for (let i = 0; i < details.length; i++) {
				const { quantity, productId } = details[i];

				const product = await this.productsService.validateStock(
					productId,
					quantity,
					warehouseOriginId.toString(),
				);
				detailsRequest.push({
					product,
					quantity: quantity,
					createdAt: new Date(),
					updateAt: new Date(),
				});
			}

			const newStockRequest = new this.stockRequestModel({
				warehouseOrigin,
				warehouseDestination,
				details: detailsRequest,
				user,
				...options,
			});
			return (await newStockRequest.save()).populate(populate);
		} catch (error) {
			return error;
		}
	}

	async update(
		id: string,
		{ details, ...options }: UpdateStockRequestInput,
		user: Partial<User>,
	) {
		try {
			const stockRequest = await this.stockRequestModel.findById(id).lean();
			if (stockRequest) {
				if (options.status) {
					switch (stockRequest.status) {
						case 'open':
							if (options.status === 'used') {
								throw new BadRequestException(
									'La solicitud se encuentra abierta y no puede ser usada',
								);
							}
							break;
						case 'pending':
							if (options.status === 'open') {
								throw new BadRequestException(
									'La solicitud se encuentra pendiente y no se puede abrir',
								);
							}
							break;
						case 'used':
							if (options.status === 'open') {
								throw new BadRequestException(
									'La solicitud se encuentra usada y no se puede abrir',
								);
							}
							if (options.status === 'pending') {
								throw new BadRequestException(
									'La solicitud se encuentra usada y no se puede enviar',
								);
							}
							if (options.status === 'cancelled') {
								throw new BadRequestException(
									'La solicitud se encuentra usada y no se puede cancelar',
								);
							}
							break;
						case 'cancelled':
							throw new BadRequestException(
								'La solicitud se encuentra cancelada',
							);
							break;
						default:
							break;
					}
					if (options.status === stockRequest.status) {
						throw new BadRequestException(
							'El estado de la solicitud debe cambiar o enviarse vacío',
						);
					}
				}

				if (stockRequest.status !== 'open') {
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

				const productsDelete = details
					.filter((detail) => detail.action === 'delete')
					.map((detail) => detail.productId.toString());

				const newDetails = stockRequest.details.filter(
					(detail) => !productsDelete.includes(detail.product._id.toString()),
				);

				for (let i = 0; i < details.length; i++) {
					const { action, productId, quantity } = details[i];

					if (action === 'create') {
						const productFind = stockRequest.details.find(
							(item) => item.product._id.toString() === productId.toString(),
						);
						if (productFind) {
							throw new BadRequestException(
								`El producto ${productFind.product.reference} / ${productFind.product.barcode} ya se encuentra registrado`,
							);
						}
						const product = await this.productsService.validateStock(
							productId,
							quantity,
							stockRequest.warehouseOrigin._id.toString(),
						);

						newDetails.push({
							product,
							quantity,
							createdAt: new Date(),
							updateAt: new Date(),
						});
					} else if (action === 'update') {
						const detailFindIndex = newDetails.findIndex(
							(item) => item.product._id.toString() === productId.toString(),
						);

						const product = await this.productsService.validateStock(
							productId,
							quantity,
							stockRequest.warehouseOrigin._id.toString(),
						);

						if (detailFindIndex === -1) {
							throw new BadRequestException(
								`El producto ${product.reference} / ${product.barcode}  no se encuentra registrado`,
							);
						}
						const productFind = newDetails[detailFindIndex];

						newDetails[detailFindIndex] = {
							...productFind,
							product,
							quantity,
							updateAt: new Date(),
						};
					}
				}

				return this.stockRequestModel.findByIdAndUpdate(
					id,
					{
						$set: { details: newDetails, ...options, user },
					},
					{
						new: true,
						lean: true,
						populate,
					},
				);
			} else {
				throw new NotFoundException('La solicitud no existe');
			}
		} catch (error) {
			return error;
		}
	}
}

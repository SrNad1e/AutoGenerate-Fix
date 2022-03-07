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
		],
	},
};

//TODO: pendiente validacion  del inventario
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
		skip = 0,
		number,
		sort,
		status,
		warehouseDestinationId,
		warehouseOriginId,
	}: FiltersStockRequestInput) {
		const filters: FilterQuery<StockRequest> = {};

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
			page: skip,
			sort,
			lean: true,
			populate,
		};

		if (sort.warehouseDestination) {
			options.sort['warehouseDestination.name'] = sort.warehouseDestination;
		}

		if (sort.warehouseOrigin) {
			options.sort['warehouseOrigin.name'] = sort.warehouseOrigin;
		}

		return this.stockRequestModel.paginate(filters, options);
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
			if (options.status) {
				if (['canceled', 'used'].includes(options.status)) {
					throw new HttpException(
						{
							status: HttpStatus.BAD_REQUEST,
							error:
								'La solicitud no puede ser creada, valide el estado de la solicitud',
						},
						HttpStatus.BAD_REQUEST,
					);
				}
			}

			const warehouseOrigin = await this.warehousesService.findById(
				warehouseOriginId,
			);

			const warehouseDestination = await this.warehousesService.findById(
				warehouseDestinationId,
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
				const detail = details[i];
				const product = await this.productsService.findById(detail.productId);
				detailsRequest.push({
					product,
					quantity: detail.quantity,
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
			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					error,
				},
				HttpStatus.BAD_REQUEST,
			);
		}
	}

	async update(
		id: string,
		{ details, ...options }: UpdateStockRequestInput,
		user,
	): Promise<StockRequest> {
		try {
			const stockRequest = await this.stockRequestModel.findById(id).lean();

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
						if (options.status === 'canceled') {
							throw new BadRequestException(
								'La solicitud se encuentra usada y no se puede cancelar',
							);
						}
						break;
					case 'canceled':
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

			const newDetails = stockRequest.details
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
					const productFind = stockRequest.details.find(
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
						createdAt: new Date(),
						updateAt: new Date(),
					});
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

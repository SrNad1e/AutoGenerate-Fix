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
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { ShopsService } from 'src/shops/services/shops.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateStockRequestInput } from '../dtos/create-stockRequest-input';
import { FiltersStockRequestsInput } from '../dtos/filters-stockRequests.input';
import { UpdateStockRequestInput } from '../dtos/update-stockRequest-input';
import { StockRequest } from '../entities/stock-request.entity';

const populate = {
	path: 'details',
	populate: {
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
};

@Injectable()
export class StockRequestService {
	constructor(
		@InjectModel(StockRequest.name)
		private readonly stockRequestModel: PaginateModel<StockRequest>,
		private readonly warehousesService: WarehousesService,
		private readonly shopsService: ShopsService,
		private readonly productsService: ProductsService,
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
			dateFinal,
			dateInitial,
		}: FiltersStockRequestsInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<StockRequest> = {};
		try {
			if (user.username !== 'admin') {
				filters['company._id'] = new Types.ObjectId(companyId);
			}

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

			return this.stockRequestModel.paginate(filters, options);
		} catch (error) {
			throw new BadRequestException(`Se ha presentado un error  ${error}`);
		}
	}

	async findAllMany({
		requests,
		status,
	}: {
		requests: string[];
		status: string[];
	}) {
		return this.stockRequestModel.find({
			_id: { $in: requests },
			status: { $in: status },
		});
	}

	async findById(id: string) {
		try {
			const response = await this.stockRequestModel
				.findById(id)
				.populate(populate)
				.lean();
			if (response) {
				return response;
			}
			throw new NotFoundException('La solicitud no existe');
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
		companyId: string,
	): Promise<StockRequest> {
		if (!(details?.length > 0)) {
			throw new BadRequestException('La solicitud no puede estar vacía');
		}

		if (options.status) {
			if (!['open', 'cancelled', 'used', 'pending'].includes(options.status)) {
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

		const detailsRequest = [];

		for (let i = 0; i < details.length; i++) {
			const { quantity, productId } = details[i];

			if (quantity <= 0) {
				throw new BadRequestException('Los productos no pueden estar en 0');
			}

			const product = await this.productsService.validateStock(
				productId,
				quantity,
				warehouseOriginId.toString(),
			);
			if (!product) {
				throw new BadRequestException('Uno de los productos no existe');
			}

			if (product?.status !== 'active') {
				throw new BadRequestException(
					`El producto ${product?.barcode} no se encuentra activo`,
				);
			}

			detailsRequest.push({
				product,
				quantity: quantity,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		const stockRequest = await this.stockRequestModel
			.findOne({ 'company._id': new Types.ObjectId(companyId) })
			.sort({ _id: -1 });

		const newStockRequest = new this.stockRequestModel({
			warehouseOrigin,
			warehouseDestination,
			details: detailsRequest,
			company: user.companies.find(
				(company) => company._id.toString() === companyId,
			),
			number: (stockRequest?.number || 0) + 1,
			user,
			...options,
		});
		return (await newStockRequest.save()).populate(populate);
	}

	async update(
		id: string,
		{ details, ...options }: UpdateStockRequestInput,
		user: Partial<User>,
		companyId: string,
	) {
		try {
			const stockRequest = await this.stockRequestModel.findById(id).lean();

			if (!stockRequest) {
				throw new NotFoundException('La solicitud no existe');
			}

			if (
				user.username !== 'admin' &&
				stockRequest.company._id.toString() !== companyId
			) {
				throw new UnauthorizedException(
					`El usuario no se encuentra autorizado para hacer cambios en la solicitud`,
				);
			}

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
			if (details && details.length > 0) {
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
								`El producto ${productFind.product.reference['name']} / ${productFind.product.barcode} ya se encuentra registrado`,
							);
						}

						if (quantity <= 0) {
							throw new BadRequestException(
								'Los productos no pueden estar en 0',
							);
						}

						const product = await this.productsService.validateStock(
							productId,
							quantity,
							stockRequest.warehouseOrigin._id.toString(),
						);

						if (!product) {
							throw new BadRequestException('Uno de los productos no existe');
						}

						if (product?.status !== 'active') {
							throw new BadRequestException(
								`El producto ${product?.barcode} no se encuentra activo`,
							);
						}

						newDetails.push({
							product,
							quantity,
							createdAt: new Date(),
							updatedAt: new Date(),
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

						if (quantity <= 0) {
							throw new BadRequestException(
								'Los productos no pueden estar en 0',
							);
						}

						newDetails[detailFindIndex] = {
							...productFind,
							product,
							quantity,
							updatedAt: new Date(),
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
				return this.stockRequestModel.findByIdAndUpdate(
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
			}
		} catch (error) {
			return error;
		}
	}

	async updateMany({
		requests,
		status,
	}: {
		requests: string[];
		status: string;
	}) {
		return this.stockRequestModel.updateMany(
			{ _id: { $in: requests } },
			{
				$set: { status },
			},
		);
	}

	async autogenerate(shopId: string, user: User, companyId: string) {
		const shop = await this.shopsService.findById(shopId);

		if (!shop) {
			throw new NotFoundException('La tienda no existe');
		}

		const warehouse = await this.warehousesService.findById(
			shop.defaultWarehouse._id.toString(),
		);

		if (!warehouse) {
			throw new NotFoundException('La tienda no tiene bodega predeterminada');
		}

		const products = await this.productsService.getProducts({
			status: 'active',
		});

		const productsRequest = products
			.map((product) => {
				const stock = product.stock.find(
					(item) => item.warehouse.toString() === warehouse._id.toString(),
				);

				return { ...product, stock };
			})
			.filter((product) => product?.stock?.quantity < warehouse?.min);

		const details = [];

		for (let i = 0; i < productsRequest.length; i++) {
			const detail = productsRequest[i];

			const product = await this.productsService.findById(
				detail._id.toString(),
				shop?.warehouseMain?._id?.toString(),
			);

			const total = warehouse.min - (detail.stock.quantity || 0);

			if (product.stock[0].quantity < total) {
				if (product.stock[0].quantity > 0) {
					details.push({
						productId: detail._id.toString(),
						quantity: product.stock[0].quantity,
					});
				}
			} else {
				details.push({
					productId: detail._id.toString(),
					quantity: total,
				});
			}
		}

		if (details.length === 0) {
			throw new BadRequestException(
				'No se encontraron productos para realizar la solicitud',
			);
		}

		return this.create(
			{
				warehouseDestinationId: shop?.defaultWarehouse?._id?.toString(),
				warehouseOriginId: shop?.warehouseMain?._id?.toString(),
				details,
			},
			user,
			companyId,
		);
	}
}

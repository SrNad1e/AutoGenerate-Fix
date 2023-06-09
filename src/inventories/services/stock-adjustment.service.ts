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
import { Reference } from 'src/products/entities/reference.entity';
import { Size } from 'src/products/entities/size.entity';
import { ProductsService } from 'src/products/services/products.service';
import { User } from 'src/configurations/entities/user.entity';
import { CreateStockAdjustmentInput } from '../dtos/create-stockAdjustment-input';
import {
	CreateStockHistoryInput,
	DocumentTypeStockHistory,
} from '../dtos/create-stockHistory-input';
import { FiltersStockAdjustmentsInput } from '../dtos/filters-stockAdjustments.input';
import {
	ActionDetailAdjustment,
	UpdateStockAdjustmentInput,
} from '../dtos/update-stockAdjustment-input';
import {
	StatusStockAdjustment,
	StockAdjustment,
} from '../entities/stock-adjustment.entity';
import { StockHistoryService } from './stock-history.service';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';
import { WarehousesService } from 'src/configurations/services/warehouses.service';
import { StatusProduct } from 'src/products/entities/product.entity';
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
						path: 'reference',
						model: Reference.name,
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
];

@Injectable()
export class StockAdjustmentService {
	constructor(
		@InjectModel(StockAdjustment.name)
		private readonly stockAdjustmetnModel: PaginateModel<StockAdjustment>,
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
		private readonly stockHistoryService: StockHistoryService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	async findAll(
		{
			number,
			sort,
			status,
			warehouseId,
			limit = 20,
			page = 1,
			dateFinal,
			dateInitial,
		}: FiltersStockAdjustmentsInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<StockAdjustment> = {};

		if (user.username !== this.configService.USER_ADMIN) {
			filters['company._id'] = new Types.ObjectId(companyId);
		}

		if (number) {
			filters.number = number;
		}

		if (StatusStockAdjustment[status]) {
			filters.status = StatusStockAdjustment[status];
		}

		if (warehouseId) {
			filters['warehouse._id'] = new Types.ObjectId(warehouseId);
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		if (sort?.warehouse) {
			options.sort['warehouse.name'] = sort.warehouse;
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

		return this.stockAdjustmetnModel.paginate(filters, options);
	}

	async findById(_id: string, user: User, companyId: string) {
		const filters: FilterQuery<StockAdjustment> = { _id };

		if (user.username !== this.configService.USER_ADMIN) {
			filters['company._id'] = new Types.ObjectId(companyId);
		}

		const response = await this.stockAdjustmetnModel
			.findOne(filters)
			.populate(populate)
			.lean();
		if (response) {
			return response;
		}
		throw new NotFoundException('El ajuste no existe');
	}

	async create(
		{ details, warehouseId, status, ...options }: CreateStockAdjustmentInput,
		user: Partial<User>,
		companyId: string,
	) {
		if (!(details?.length > 0)) {
			throw new BadRequestException('El ajuste no puede estar vacía');
		}

		if (StatusStockAdjustment[status]) {
			if (StatusStockAdjustment[status] === StatusStockAdjustment.CANCELLED) {
				throw new BadRequestException(
					'El ajuste no puede ser creada, valide el estado del ajuste',
				);
			}
		}

		const warehouse = await this.warehousesService.findById(warehouseId);

		if (!warehouse?.active) {
			throw new BadRequestException(
				'La bodega no existe o se encuentra inactiva',
			);
		}

		const detailsAdjustment = [];

		for (let i = 0; i < details.length; i++) {
			const { quantity, productId } = details[i];
			const product = await this.productsService.findById(
				productId,
				warehouseId,
			);

			if (!product) {
				throw new BadRequestException('Uno de los productos no existe');
			}

			if (product?.status !== StatusProduct.ACTIVE) {
				throw new BadRequestException(
					`El producto ${product?.barcode} no se encuentra activo`,
				);
			}

			detailsAdjustment.push({
				product,
				quantity,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}

		const total = detailsAdjustment.reduce(
			(sum, detail) => sum + detail.quantity * detail.product.reference.cost,
			0,
		);

		const stockAdjustment = await this.stockAdjustmetnModel
			.findOne({ 'company._id': new Types.ObjectId(companyId) })
			.sort({ _id: -1 });

		const newStockInput = new this.stockAdjustmetnModel({
			warehouse,
			details: detailsAdjustment,
			total,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			status: StatusStockAdjustment[status],
			company: user.company,
			number: (stockAdjustment?.number || 0) + 1,
			...options,
		});

		const response = await (await newStockInput.save()).populate(populate);

		if (StatusStockAdjustment[status] === StatusStockAdjustment.CONFIRMED) {
			const detailsDelete = response.details
				.filter((detail) => detail.product.stock[0].quantity > detail.quantity)
				.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.product.stock[0].quantity - detail.quantity,
				}));

			const detailsAdd = response.details
				.filter((detail) => detail.product.stock[0].quantity < detail.quantity)
				.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity - detail.product.stock[0].quantity,
				}));

			const deleteStockHistoryInput: CreateStockHistoryInput = {
				details: detailsDelete,
				warehouseId,
				documentId: response._id.toString(),
				documentType: DocumentTypeStockHistory.ADJUSTMENT,
			};

			const addStockHistoryInput: CreateStockHistoryInput = {
				details: detailsAdd,
				warehouseId,
				documentId: response._id.toString(),
				documentType: DocumentTypeStockHistory.ADJUSTMENT,
			};

			if (deleteStockHistoryInput?.details?.length > 0) {
				await this.stockHistoryService.deleteStock(
					deleteStockHistoryInput,
					user,
					companyId,
				);
			}
			if (addStockHistoryInput?.details?.length > 0) {
				await this.stockHistoryService.addStock(
					addStockHistoryInput,
					user,
					companyId,
				);
			}
		}
		return response;
	}

	async update(
		id: string,
		{ details, status, ...options }: UpdateStockAdjustmentInput,
		user: User,
		companyId: string,
	) {
		const stockAdjustment = await this.stockAdjustmetnModel.findById(id).lean();
		if (
			user.username !== this.configService.USER_ADMIN &&
			stockAdjustment.company._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no se encuentra autorizado para hacer cambios en el ajuste`,
			);
		}

		if (StatusStockAdjustment[status]) {
			if (!stockAdjustment) {
				throw new BadRequestException('El ajuste no existe');
			}

			if (stockAdjustment.status === StatusStockAdjustment.CANCELLED) {
				throw new BadRequestException('El ajuste se encuenta cancelado');
			}

			if (stockAdjustment.status === StatusStockAdjustment.CONFIRMED) {
				throw new BadRequestException('El ajuste se encuentra confirmado');
			}

			if (StatusStockAdjustment[status] === stockAdjustment.status) {
				throw new BadRequestException(
					'El estado del ajuste debe cambiar o enviarse vacío',
				);
			}
		}

		if (details && details.length > 0) {
			const productsDelete = details
				.filter(
					(detail) =>
						ActionDetailAdjustment[detail.action] ===
						ActionDetailAdjustment.DELETE,
				)
				.map((detail) => detail.productId.toString());

			const newDetails = stockAdjustment.details
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
							updatedAt: new Date(),
						};
					}
					return detail;
				});
			for (let i = 0; i < details.length; i++) {
				const { action, productId, quantity } = details[i];

				if (ActionDetailAdjustment[action] === ActionDetailAdjustment.CREATE) {
					const productFind = stockAdjustment.details.find(
						(item) => item.product._id.toString() === productId.toString(),
					);
					if (productFind) {
						throw new BadRequestException(
							`El producto ${productFind?.product?.reference['name']} / ${productFind.product.barcode} ya se encuentra registrado`,
						);
					}
					const product = await this.productsService.findById(
						productId,
						stockAdjustment.warehouse._id.toString(),
					);
					if (!product) {
						throw new BadRequestException('Uno de los productos no existe');
					}

					if (product?.status !== StatusProduct.ACTIVE) {
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
				}
			}

			const total = newDetails.reduce(
				(sum, detail) =>
					sum + detail.quantity * detail.product.reference['cost'],
				0,
			);

			if (newDetails.length === 0) {
				throw new BadRequestException('El ajuste no puede estar vacío');
			}

			const response = await this.stockAdjustmetnModel.findByIdAndUpdate(
				id,
				{
					$set: {
						...options,
						details: newDetails,
						total,
						status: StatusStockAdjustment[status],
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

			if (StatusStockAdjustment[status] === StatusStockAdjustment.CONFIRMED) {
				const detailsDelete = response.details
					.filter(
						(detail) => detail.product.stock[0].quantity > detail.quantity,
					)
					.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.product.stock[0].quantity - detail.quantity,
					}));

				const detailsAdd = response.details
					.filter(
						(detail) => detail.product.stock[0].quantity < detail.quantity,
					)
					.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.quantity,
					}));

				const deleteStockHistoryInput: CreateStockHistoryInput = {
					details: detailsDelete,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.ADJUSTMENT,
				};

				const addStockHistoryInput: CreateStockHistoryInput = {
					details: detailsAdd,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.ADJUSTMENT,
				};

				if (deleteStockHistoryInput?.details?.length > 0) {
					await this.stockHistoryService.deleteStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}

				if (addStockHistoryInput?.details?.length > 0) {
					await this.stockHistoryService.addStock(
						addStockHistoryInput,
						user,
						companyId,
					);
				}
			}

			return response;
		} else {
			const response = await this.stockAdjustmetnModel.findByIdAndUpdate(
				id,
				{
					$set: { ...options, status: StatusStockAdjustment[status], user },
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);

			if (StatusStockAdjustment[status] === StatusStockAdjustment.CONFIRMED) {
				//colsultar stock de productos

				const newDetails = [];

				for (let i = 0; i < response.details.length; i++) {
					const {
						product: { _id },
					} = response.details[i];
					const product = await this.productsService.findById(
						_id.toString(),
						response?.warehouse?._id?.toString(),
					);

					newDetails.push({
						...response?.details[i],
						product,
					});
				}

				const detailsDelete = newDetails
					.filter(
						(detail) => detail.product.stock[0].quantity > detail.quantity,
					)
					.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.product.stock[0].quantity - detail.quantity,
					}));

				const detailsAdd = newDetails
					.filter(
						(detail) => detail.product.stock[0].quantity < detail.quantity,
					)
					.map((detail) => ({
						productId: detail.product._id.toString(),
						quantity: detail.quantity,
					}));

				const deleteStockHistoryInput: CreateStockHistoryInput = {
					details: detailsDelete,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.ADJUSTMENT,
				};

				const addStockHistoryInput: CreateStockHistoryInput = {
					details: detailsAdd,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.ADJUSTMENT,
				};

				if (deleteStockHistoryInput?.details?.length > 0) {
					await this.stockHistoryService.deleteStock(
						deleteStockHistoryInput,
						user,
						companyId,
					);
				}

				if (addStockHistoryInput?.details?.length > 0) {
					await this.stockHistoryService.addStock(
						addStockHistoryInput,
						user,
						companyId,
					);
				}
			}

			return response;
		}
	}
}

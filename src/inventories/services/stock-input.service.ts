import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { AddStockHistoryInput } from '../dtos/add-stockHistory-input';
import { CreateStockInputInput } from '../dtos/create-stockInput-input';
import { FiltersStockInputInput } from '../dtos/filters-stockInput.input';
import { UpdateStockInputInput } from '../dtos/update-stockInput-input';
import { StockInput } from '../entities/stock-input.entity';
import { StockHistoryService } from './stock-history.service';

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
];

const statusTypes = ['cancelled', 'open', 'confirmed'];

@Injectable()
export class StockInputService {
	constructor(
		@InjectModel(StockInput.name)
		private readonly stockInputModel: PaginateModel<StockInput>,
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
		private readonly stockHistoryService: StockHistoryService,
	) {}

	async findAll({
		number,
		sort,
		status,
		warehouseId,
		limit = 20,
		page = 1,
		dateFinal,
		dateInitial,
	}: FiltersStockInputInput) {
		const filters: FilterQuery<StockInput> = {};
		try {
			if (number) {
				filters.number = number;
			}

			if (status) {
				filters.status = status;
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
			return this.stockInputModel.paginate(filters, options);
		} catch (error) {
			return error;
		}
	}

	async findById(id: string) {
		try {
			const response = await this.stockInputModel
				.findById(id)
				.populate(populate)
				.lean();
			if (response) {
				return response;
			}
			throw new NotFoundException('La salida no existe');
		} catch (error) {
			return error;
		}
	}

	async create(
		{ details, warehouseId, ...options }: CreateStockInputInput,
		user: Partial<User>,
	) {
		try {
			if (!(details?.length > 0)) {
				throw new BadRequestException('La entrada no puede estar vacía');
			}

			if (options.status) {
				if (!statusTypes.includes(options.status)) {
					throw new BadRequestException(
						`Es estado ${options.status} no es un estado válido`,
					);
				}

				if (options.status === 'cancelled') {
					throw new BadRequestException(
						'La entrada no puede ser creada, valide el estado de la entrada',
					);
				}
			}

			const warehouse = await this.warehousesService.findById(warehouseId);

			if (!warehouse?.active) {
				throw new BadRequestException(
					'La bodega no existe o se encuentra inactiva',
				);
			}

			const detailsInput = [];

			for (let i = 0; i < details.length; i++) {
				const { quantity, productId } = details[i];
				const product = await this.productsService.findById(
					productId,
					warehouseId,
				);

				detailsInput.push({
					product,
					quantity,
					createdAt: new Date(),
					updateAt: new Date(),
				});
			}
			const total = detailsInput.reduce(
				(sum, detail) => sum + detail.quantity * detail.product.cost,
				0,
			);
			const newStockInput = new this.stockInputModel({
				warehouse,
				details: detailsInput,
				total,
				user,
				...options,
			});

			const response = await (await newStockInput.save()).populate(populate);

			if (options.status === 'confirmed') {
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const addStockHistoryInput: AddStockHistoryInput = {
					details: detailHistory,
					warehouseId,
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.addStock(addStockHistoryInput);
			}
			return response;
		} catch (error) {
			return error;
		}
	}

	async update(
		id: string,
		{ details, ...options }: UpdateStockInputInput,
		user: User,
	) {
		const stockInput = await this.stockInputModel.findById(id).lean();

		if (!statusTypes.includes(options.status)) {
			throw new BadRequestException(
				`Es estado ${options.status} no es un estado válido`,
			);
		}

		if (!stockInput) {
			throw new BadRequestException('La entrada no existe');
		}

		if (stockInput.status === 'cancelled') {
			throw new BadRequestException('La entrada se encuenta cancelada');
		}

		if (stockInput.status === 'confirmed') {
			throw new BadRequestException('La entrada se encuentra confirmada');
		}

		if (options.status) {
			if (options.status === stockInput.status) {
				throw new BadRequestException(
					'El estado de la entrada debe cambiar o enviarse vacío',
				);
			}
		}

		if (details && details.length > 0) {
			const productsDelete = details
				.filter((detail) => detail.action === 'delete')
				.map((detail) => detail.productId.toString());

			const newDetails = stockInput.details
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
					const productFind = stockInput.details.find(
						(item) => item.product._id.toString() === productId.toString(),
					);
					if (productFind) {
						throw new BadRequestException(
							`El producto ${productFind.product.reference} / ${productFind.product.barcode} ya se encuentra registrado`,
						);
					}
					const product = await this.productsService.findById(
						productId,
						stockInput.warehouse._id.toString(),
					);
					newDetails.push({
						product,
						quantity,
						createdAt: new Date(),
						updateAt: new Date(),
					});
				}
			}

			const total = newDetails.reduce(
				(sum, detail) => sum + detail.quantity * detail.product.cost,
				0,
			);

			const response = await this.stockInputModel.findByIdAndUpdate(
				id,
				{
					$set: { details: newDetails, total, ...options, user },
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);

			if (options.status === 'confirmed') {
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const addStockHistoryInput: AddStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.addStock(addStockHistoryInput);
			}

			return response;
		} else {
			const response = await this.stockInputModel.findByIdAndUpdate(
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

			if (options.status === 'confirmed') {
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const addStockHistoryInput: AddStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.addStock(addStockHistoryInput);
			}

			return response;
		}
	}
}

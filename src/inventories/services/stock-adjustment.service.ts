import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateStockAdjustmentInput } from '../dtos/create-stockAdjustment-input';
import { DeleteStockHistoryInput } from '../dtos/delete-stockHistory-input';
import { FiltersStockAdjustmentInput } from '../dtos/filters-stockAdjustment.input';
import { UpdateStockAdjustmentInput } from '../dtos/update-stockAdjustment-input';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
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
export class StockAdjustmentService {
	constructor(
		@InjectModel(StockAdjustment.name)
		private readonly stockAdjustmetnModel: PaginateModel<StockAdjustment>,
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
	}: FiltersStockAdjustmentInput) {
		const filters: FilterQuery<StockAdjustment> = {};
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
			return this.stockAdjustmetnModel.paginate(filters, options);
		} catch (error) {
			return error;
		}
	}

	async findById(id: string) {
		try {
			const response = await this.stockAdjustmetnModel
				.findById(id)
				.populate(populate)
				.lean();
			if (response) {
				return response;
			}
			throw new NotFoundException('La entrada no existe');
		} catch (error) {
			return error;
		}
	}

	async create(
		{ details, warehouseId, ...options }: CreateStockAdjustmentInput,
		user: Partial<User>,
	) {
		try {
			if (!(details?.length > 0)) {
				throw new BadRequestException('El ajuste no puede estar vacía');
			}

			if (options.status) {
				if (!statusTypes.includes(options.status)) {
					throw new BadRequestException(
						`Es estado ${options.status} no es un estado válido`,
					);
				}

				if (options.status === 'cancelled') {
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
			const newStockInput = new this.stockAdjustmetnModel({
				warehouse,
				details: detailsInput,
				total,
				user,
				...options,
			});

			const response = await (await newStockInput.save()).populate(populate);

			if (options.status === 'confirmed') {
				//TODO: revisar proceso de inventarios
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const deleteStockHistoryInput: DeleteStockHistoryInput = {
					details: detailHistory,
					warehouseId,
					documentId: response._id.toString(),
					documentType: 'output',
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
		{ details, ...options }: UpdateStockAdjustmentInput,
		user: User,
	) {
		const stockInput = await this.stockAdjustmetnModel.findById(id).lean();

		if (!statusTypes.includes(options.status)) {
			throw new BadRequestException(
				`Es estado ${options.status} no es un estado válido`,
			);
		}

		if (!stockInput) {
			throw new BadRequestException('El ajuste no existe');
		}

		if (stockInput.status === 'cancelled') {
			throw new BadRequestException('El ajuste se encuenta cancelado');
		}

		if (stockInput.status === 'confirmed') {
			throw new BadRequestException('El ajuste se encuentra confirmado');
		}

		if (options.status) {
			if (options.status === stockInput.status) {
				throw new BadRequestException(
					'El estado del ajuste debe cambiar o enviarse vacío',
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

			const response = await this.stockAdjustmetnModel.findByIdAndUpdate(
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
				//TODO: organizar el proceso de inventarios
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const deleteStockHistoryInput: DeleteStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.deleteStock(deleteStockHistoryInput);
			}

			return response;
		} else {
			const response = await this.stockAdjustmetnModel.findByIdAndUpdate(
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
				//TODO: organizar el proceso de inventarios
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const deleteStockHistoryInput: DeleteStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.deleteStock(deleteStockHistoryInput);
			}

			return response;
		}
	}
}

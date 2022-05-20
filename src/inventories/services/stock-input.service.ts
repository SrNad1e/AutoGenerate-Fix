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
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateStockHistoryInput } from '../dtos/create-stockHistory-input';
import { CreateStockInputInput } from '../dtos/create-stockInput-input';
import { FiltersStockInputsInput } from '../dtos/filters-stockInputs.input';
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
		}: FiltersStockInputsInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<StockInput> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

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
	}

	async findById(_id: string, user: Partial<User>, companyId: string) {
		const filters: FilterQuery<StockInput> = { _id };

		if (user.username !== 'admin') {
			filters.company = companyId;
		}

		const response = await this.stockInputModel
			.findById(filters)
			.populate(populate)
			.lean();
		if (response) {
			return response;
		}
		throw new NotFoundException('La salida no existe');
	}

	async create(
		{ details, warehouseId, ...options }: CreateStockInputInput,
		user: Partial<User>,
		companyId: string,
	) {
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

			if (quantity <= 0) {
				throw new BadRequestException('Los productos no pueden estar en 0');
			}

			const product = await this.productsService.findById(
				productId,
				warehouseId,
			);

			if (!product) {
				throw new BadRequestException('Uno de los productos no existe');
			}

			if (product?.status !== 'active') {
				throw new BadRequestException(
					`El producto ${product?.barcode} no se encuentra activo`,
				);
			}

			detailsInput.push({
				product,
				quantity,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
		const total = detailsInput.reduce(
			(sum, detail) => sum + detail.quantity * detail.product.reference.cost,
			0,
		);

		const stockInput = await this.stockInputModel
			.findOne({ 'company._id': new Types.ObjectId(companyId) })
			.sort({ _id: -1 });

		const newStockInput = new this.stockInputModel({
			warehouse,
			details: detailsInput,
			total,
			user,
			company: user.companies.find(
				(company) => company._id.toString() === companyId,
			),
			number: (stockInput?.number || 0) + 1,
			...options,
		});

		const response = await (await newStockInput.save()).populate(populate);

		if (options.status === 'confirmed') {
			const detailHistory = response.details.map((detail) => ({
				productId: detail.product._id.toString(),
				quantity: detail.quantity,
			}));

			const addStockHistoryInput: CreateStockHistoryInput = {
				details: detailHistory,
				warehouseId,
				documentId: response._id.toString(),
				documentType: 'input',
			};
			await this.stockHistoryService.addStock(
				addStockHistoryInput,
				user,
				companyId,
			);
		}
		return response;
	}

	async update(
		id: string,
		{ details, ...options }: UpdateStockInputInput,
		user: User,
		companyId: string,
	) {
		const stockInput = await this.stockInputModel.findById(id).lean();
		if (!stockInput) {
			throw new NotFoundException('La entrada no existe');
		}

		if (
			user.username !== 'admin' &&
			stockInput.company._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no se encuentra autorizado para hacer cambios en la entrada`,
			);
		}

		if (options.status) {
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
							updatedAt: new Date(),
						};
					}
					return detail;
				});
			for (let i = 0; i < details.length; i++) {
				const { action, productId, quantity } = details[i];

				const productFind = stockInput.details.find(
					(item) => item.product._id.toString() === productId.toString(),
				);

				if (action === 'create') {
					if (productFind) {
						throw new BadRequestException(
							`El producto ${productFind.product.reference['name']} / ${productFind.product.barcode} ya se encuentra registrado`,
						);
					}
					const product = await this.productsService.findById(
						productId,
						stockInput.warehouse._id.toString(),
					);

					if (quantity <= 0) {
						throw new BadRequestException('Los productos no pueden estar en 0');
					}

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
				}
			}

			const total = newDetails.reduce(
				(sum, detail) =>
					sum + detail.quantity * detail.product.reference['cost'],
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

				const addStockHistoryInput: CreateStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.addStock(
					addStockHistoryInput,
					user,
					companyId,
				);
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

				const addStockHistoryInput: CreateStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: 'input',
				};
				await this.stockHistoryService.addStock(
					addStockHistoryInput,
					user,
					companyId,
				);
			}

			return response;
		}
	}
}

import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { User } from 'src/configurations/entities/user.entity';
import { CreateStockOutputInput } from '../dtos/create-stockOutput-input';
import { FiltersStockOutputsInput } from '../dtos/filters-stockOutputs.input';
import {
	ActionDetailOutput,
	UpdateStockOutputInput,
} from '../dtos/update-stockOutput-input';
import {
	StatusStockOutput,
	StockOutput,
} from '../entities/stock-output.entity';
import { StockHistoryService } from './stock-history.service';
import { Size } from 'src/products/entities/size.entity';
import { Color } from 'src/products/entities/color.entity';
import {
	CreateStockHistoryInput,
	DocumentTypeStockHistory,
} from '../dtos/create-stockHistory-input';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';
import { WarehousesService } from 'src/configurations/services/warehouses.service';
import { StatusProduct } from 'src/products/entities/product.entity';

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

@Injectable()
export class StockOutputService {
	constructor(
		@InjectModel(StockOutput.name)
		private readonly stockOutputModel: PaginateModel<StockOutput>,
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
		}: FiltersStockOutputsInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<StockOutput> = {};

		if (user.username !== 'admin') {
			filters['company._id'] = new Types.ObjectId(companyId);
		}

		if (number) {
			filters.number = number;
		}

		if (StatusStockOutput[status]) {
			filters.status = StatusStockOutput[status];
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
		return this.stockOutputModel.paginate(filters, options);
	}

	async findById(_id: string, user: Partial<User>, companyId: string) {
		const filters: FilterQuery<StockOutput> = { _id };
		if (user.username !== 'admin') {
			filters['company._id'] = new Types.ObjectId(companyId);
		}
		const response = await this.stockOutputModel
			.findById(filters)
			.populate(populate)
			.lean();
		if (response) {
			return response;
		}
		throw new NotFoundException('La salida no existe');
	}

	async create(
		{ details, warehouseId, status, ...options }: CreateStockOutputInput,
		user: Partial<User>,
		companyId: string,
	) {
		if (!(details?.length > 0)) {
			throw new BadRequestException('La salida no puede estar vacía');
		}

		if (StatusStockOutput[status]) {
			if (StatusStockOutput[status] === StatusStockOutput.CANCELLED) {
				throw new BadRequestException(
					'La salida no puede ser creada, valide el estado de la salida',
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

			const product = await this.productsService.validateStock(
				productId,
				quantity,
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

		const stockOutput = await this.stockOutputModel
			.findOne({ 'company._id': new Types.ObjectId(companyId) })
			.sort({ _id: -1 });

		const newStockInput = new this.stockOutputModel({
			...options,
			warehouse,
			details: detailsInput,
			total,
			user,
			status: StatusStockOutput[status],
			company: user.companies.find(
				(company) => company._id.toString() === companyId,
			),
			number: (stockOutput?.number || 0) + 1,
		});

		const response = await (await newStockInput.save()).populate(populate);

		if (StatusStockOutput[status] === StatusStockOutput.CONFIRMED) {
			const detailHistory = response.details.map((detail) => ({
				productId: detail.product._id.toString(),
				quantity: detail.quantity,
			}));

			const deleteStockHistoryInput: CreateStockHistoryInput = {
				details: detailHistory,
				warehouseId,
				documentId: response._id.toString(),
				documentType: DocumentTypeStockHistory.OUTPUT,
			};
			await this.stockHistoryService.deleteStock(
				deleteStockHistoryInput,
				user,
				companyId,
			);
		}
		return response;
	}

	async update(
		id: string,
		{ details, status, ...options }: UpdateStockOutputInput,
		user: User,
		companyId: string,
	) {
		const stockOutput = await this.stockOutputModel.findById(id).lean();

		if (
			user.username !== 'admin' &&
			stockOutput.company._id.toString() !== companyId
		) {
			throw new UnauthorizedException(
				`El usuario no se encuentra autorizado para hacer cambios en la salida`,
			);
		}

		if (StatusStockOutput[status]) {
			if (!stockOutput) {
				throw new BadRequestException('La salida no existe');
			}

			if (stockOutput.status === StatusStockOutput.CANCELLED) {
				throw new BadRequestException('La salida se encuenta cancelada');
			}

			if (stockOutput.status === StatusStockOutput.CONFIRMED) {
				throw new BadRequestException('La salida se encuentra confirmada');
			}

			if (StatusStockOutput[status] === stockOutput.status) {
				throw new BadRequestException(
					'El estado de la salida debe cambiar o enviarse vacío',
				);
			}
		}

		if (details && details.length > 0) {
			const productsDelete = details
				.filter(
					(detail) =>
						ActionDetailOutput[detail.action] === ActionDetailOutput.DELETE,
				)
				.map((detail) => detail.productId.toString());

			const newDetails = stockOutput.details
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

				const product = await this.productsService.validateStock(
					productId,
					quantity,
					stockOutput.warehouse._id.toString(),
				);

				if (!product) {
					throw new BadRequestException('Uno de los productos no existe');
				}

				if (product?.status !== StatusProduct.ACTIVE) {
					throw new BadRequestException(
						`El producto ${product?.barcode} no se encuentra activo`,
					);
				}

				if (ActionDetailOutput[action] === ActionDetailOutput.CREATE) {
					if (quantity <= 0) {
						throw new BadRequestException('Los productos no pueden estar en 0');
					}
					const productFind = stockOutput.details.find(
						(item) => item.product._id.toString() === productId.toString(),
					);
					if (productFind) {
						throw new BadRequestException(
							`El producto ${productFind.product.reference['name']} / ${productFind.product.barcode} ya se encuentra registrado`,
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
				throw new BadRequestException('La salida no puede estar vacía');
			}

			const response = await this.stockOutputModel.findByIdAndUpdate(
				id,
				{
					$set: {
						...options,
						details: newDetails,
						total,
						status: StatusStockOutput[status],
						user,
					},
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);

			if (StatusStockOutput[status] === StatusStockOutput.CONFIRMED) {
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const deleteStockHistoryInput: CreateStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.OUTPUT,
				};
				await this.stockHistoryService.deleteStock(
					deleteStockHistoryInput,
					user,
					companyId,
				);
			}

			return response;
		} else {
			const response = await this.stockOutputModel.findByIdAndUpdate(
				id,
				{
					$set: { ...options, status: StatusStockOutput[status], user },
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);

			if (StatusStockOutput[status] === StatusStockOutput.CONFIRMED) {
				const detailHistory = response.details.map((detail) => ({
					productId: detail.product._id.toString(),
					quantity: detail.quantity,
				}));

				const deleteStockHistoryInput: CreateStockHistoryInput = {
					details: detailHistory,
					warehouseId: response.warehouse._id.toString(),
					documentId: response._id.toString(),
					documentType: DocumentTypeStockHistory.OUTPUT,
				};
				await this.stockHistoryService.deleteStock(
					deleteStockHistoryInput,
					user,
					companyId,
				);
			}

			return response;
		}
	}
}

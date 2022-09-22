import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	FilterQuery,
	Types,
	AggregatePaginateModel,
	ProjectionType,
} from 'mongoose';

import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-products.input';
import { Product, StatusProduct } from '../entities/product.entity';
import { ColorsService } from './colors.service';
import { SizesService } from './sizes.service';
import { ReferencesService } from './references.service';
import { CreateProductInput } from '../dtos/create-product.input';
import { UpdateProductInput } from '../dtos/update-product.input';
import { Reference } from '../entities/reference.entity';
import { Size } from '../entities/size.entity';
import { Color } from '../entities/color.entity';
import { Image } from 'src/configurations/entities/image.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';
import { WarehousesService } from 'src/configurations/services/warehouses.service';

const populate = [
	{
		path: 'stock',
		populate: [
			{
				path: 'warehouse',
				model: Warehouse.name,
			},
		],
	},
	{ path: 'color', model: Color.name },
	{ path: 'size', model: Size.name },
	{ path: 'reference', model: Reference.name },
	{ path: 'images', model: Image.name },
];

const lookup = [
	{
		$lookup: {
			from: 'sizes',
			localField: 'size',
			foreignField: '_id',
			as: 'size',
		},
	},
	{
		$lookup: {
			from: 'colors',
			localField: 'color',
			foreignField: '_id',
			as: 'color',
		},
	},
	{
		$lookup: {
			from: 'references',
			localField: 'reference',
			foreignField: '_id',
			as: 'reference',
		},
	},
	{
		$lookup: {
			from: 'images',
			localField: 'images',
			foreignField: '_id',
			as: 'images',
		},
	},
];

const project: ProjectionType<Product> = {
	stock: 1,
	user: 1,
	status: 1,
	images: 1,
	barcode: 1,
	createdAt: 1,
	updatedAt: 1,
	size: {
		$arrayElemAt: ['$size', 0],
	},
	reference: {
		$arrayElemAt: ['$reference', 0],
	},
	color: {
		$arrayElemAt: ['$color', 0],
	},
};

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: AggregatePaginateModel<Product>,
		private readonly colorsService: ColorsService,
		private readonly sizesService: SizesService,
		private readonly referencesService: ReferencesService,
		private readonly warehousesService: WarehousesService,
	) {}

	async findAll(
		{
			colorId,
			limit = 10,
			page = 1,
			name = '',
			sizeId,
			status,
			sort,
			ids,
			warehouseId,
			referenceId,
			withStock = false,
		}: FiltersProductsInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<Product> = {};
		const aggregate = [];

		if (ids) {
			filters._id = {
				$in: ids.map((_id) => new Types.ObjectId(_id)),
			};
		}

		if (colorId) {
			filters.color = new Types.ObjectId(colorId);
		}

		if (sizeId) {
			filters.size = new Types.ObjectId(sizeId);
		}

		if (StatusProduct[status]) {
			filters.status = StatusProduct[status];
		}

		if (name) {
			const references = await this.referencesService.findAll(
				{
					name,
				},
				false,
				companyId,
			);

			if (references?.totalDocs > 0) {
				filters.reference = {
					$in: references.docs.map((item) => item._id),
				};
			} else {
				filters.barcode = name;
			}
		}

		if (referenceId) {
			filters.reference = new Types.ObjectId(referenceId);
		}

		if (warehouseId) {
			if (warehouseId !== 'all') {
				filters['stock.warehouse'] = new Types.ObjectId(warehouseId);
				aggregate.push({
					$unwind: '$stock',
				});
				project['stock'] = ['$stock'];
			}
		}

		if (withStock && warehouseId) {
			filters['stock.warehouse'] = new Types.ObjectId(warehouseId);
			filters['stock.quantity'] = {
				$gt: 0,
			};
			aggregate.push({
				$unwind: '$stock',
			});
			project['stock'] = ['$stock'];
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		const aggregateProduct = this.productModel.aggregate([
			...aggregate,
			{
				$match: filters,
			},
			...lookup,
			{
				$project: project,
			},
		]);

		return this.productModel.aggregatePaginate(aggregateProduct, options);
	}

	async findOne({ warehouseId, ...params }: FiltersProductInput) {
		const product = await this.productModel
			.findOne(params)
			.lean()
			.populate(populate);

		if (warehouseId) {
			if (warehouseId === 'all') {
				return product;
			}

			const stock = product.stock.filter(
				(item) => item.warehouse._id.toString() === warehouseId,
			);

			return {
				...(product as Product),
				stock,
			};
		}

		return {
			...product,
			stock: [],
		};
	}

	async findById(id: string, warehouseId?: string) {
		const productQuery = await this.productModel
			.findById(id)
			.populate(populate)
			.lean();

		if (productQuery) {
			const { stock, ...product } = productQuery;
			if (warehouseId) {
				if (warehouseId === 'all') {
					return {
						...product,
						stock,
					};
				}
				const stockLocal = stock.filter(
					(item) => item.warehouse._id.toString() === warehouseId,
				);

				return {
					...product,
					stock: stockLocal,
				};
			}

			return { ...product, stock: [] };
		} else {
			throw new NotFoundException('El producto no existe');
		}
	}

	async create(
		{ referenceId, colorId, sizeId, imagesId }: CreateProductInput,
		user: User,
		companyId: string,
	) {
		const reference = await this.referencesService.findById(referenceId);
		if (!reference) {
			throw new NotFoundException('La referencia no existe');
		}

		const product = await this.findOne({
			size: sizeId,
			color: colorId,
			reference: referenceId,
		});

		if (product?._id) {
			throw new NotFoundException(
				`La combianción de talla y color ya existe para la referencia ${reference.name}`,
			);
		}

		const color = await this.colorsService.findById(colorId);

		if (!color) {
			throw new NotFoundException('El color no existe');
		}

		const size = await this.sizesService.findById(sizeId);

		if (!size) {
			throw new NotFoundException('La talla no existe');
		}

		const products = await this.findAll({}, user, companyId);
		const total = () => {
			const totalData = products.totalDocs + 1;
			if (totalData < 10) {
				return `00000${totalData}`;
			}

			if (totalData < 100) {
				return `0000${totalData}`;
			}

			if (totalData < 1000) {
				return `000${totalData}`;
			}

			if (totalData < 10000) {
				return `00${totalData}`;
			}

			if (totalData < 100000) {
				return `0${totalData}`;
			}

			if (totalData < 1000000) {
				return `${totalData}`;
			}
		};
		const barcode = `7700000${total()}`;

		const warehouses = await this.warehousesService.findAll(
			{
				limit: -1,
			},
			{
				username: 'admin',
			},
			companyId,
		);

		const stock = warehouses.docs.map((warehouse) => ({
			warehouse: warehouse._id,
			quantity: 0,
		}));

		return (
			await this.productModel.create({
				reference: reference?._id,
				color: color?._id,
				size: size?._id,
				images: imagesId?.map((id) => new Types.ObjectId(id)),
				barcode,
				stock,
				user,
			})
		).populate(populate);
	}

	async update(
		id: string,
		{ colorId, sizeId, status, barcode, imagesId }: UpdateProductInput,
		user: User,
	) {
		const product = await this.productModel.findById(id).lean();

		if (!product) {
			throw new NotFoundException('El producto no existe');
		}

		let color;
		if (colorId) {
			color = await this.colorsService.findById(colorId);

			if (!color) {
				throw new NotFoundException('El color no existe');
			}
		}

		let size;
		if (sizeId) {
			size = await this.sizesService.findById(sizeId);

			if (!size) {
				throw new NotFoundException('La talla no existe');
			}
		}

		if (barcode) {
			const productCodeBar = await this.findOne({ barcode });

			if (productCodeBar) {
				throw new NotFoundException(
					`El código de barras ${barcode}, está asignada al producto ${productCodeBar?.reference['name']} / ${productCodeBar?.color['name']} - ${productCodeBar?.size['name']}  `,
				);
			}
		}

		let newStatus;
		if (StatusProduct[status]) {
			newStatus = StatusProduct[status];
		}

		return this.productModel.findByIdAndUpdate(
			id,
			{
				$set: {
					color: color?._id,
					size: size?._id,
					barcode,
					status: newStatus,
					images: imagesId?.map((item) => new Types.ObjectId(item)) || [],
					user,
				},
			},
			{
				lean: true,
				new: true,
				populate,
			},
		);
	}

	/**
	 * @description se encarga de agregar unidades al inventario
	 * @param productId producto a agregar stock
	 * @param quantity cantidad de stock
	 * @param warehouseId bodega a agregar stock
	 * @returns si todo sale bien el producto actualizado
	 */
	async addStock(productId: string, quantity: number, warehouseId: string) {
		const product = await this.productModel.findById(productId).lean();

		if (!product) {
			throw new BadRequestException('El producto no existe');
		}

		const stock = product.stock.map((item) => {
			if (item.warehouse._id.toString() === warehouseId) {
				return {
					warehouse: item.warehouse._id,
					quantity: item.quantity + quantity,
				};
			}

			return item;
		});

		const response = await this.productModel.findByIdAndUpdate(
			productId,
			{
				$set: {
					stock,
				},
			},
			{
				lean: true,
				new: true,
				populate,
			},
		);

		const newStock = response.stock.filter(
			(item) => item.warehouse._id.toString() === warehouseId,
		);

		return {
			...response,
			stock: newStock,
		};
	}

	/**
	 * @description se encarga de eliminar unidades al inventario
	 * @param productId producto a eliminar stock
	 * @param quantity cantidad de stock
	 * @param warehouseId bodega a eliminar stock
	 * @returns si todo sale bien el producto actualizado
	 */
	async deleteStock(productId: string, quantity: number, warehouseId: string) {
		const product = await this.productModel
			.findById(productId)
			.populate([
				{
					path: 'reference',
					model: Reference.name,
				},
			])
			.lean();

		if (!product) {
			throw new BadRequestException('El producto no existe');
		}

		const stockSelected = product.stock.find(
			(item) => item.warehouse._id.toString() === warehouseId,
		);

		if (stockSelected?.quantity < quantity) {
			throw new BadRequestException(
				`Inventario insuficiente para el producto ${product.reference['name']} / ${product.barcode}, stock ${stockSelected.quantity}`,
			);
		}

		const stock = product.stock.map((item) => {
			if (item.warehouse._id.toString() === warehouseId) {
				return {
					warehouse: item.warehouse._id,
					quantity: item.quantity - quantity,
				};
			}

			return item;
		});

		const response = await this.productModel.findByIdAndUpdate(
			productId,
			{
				$set: {
					stock,
				},
			},
			{
				lean: true,
				new: true,
				populate,
			},
		);

		const newStock = response.stock.filter(
			(item) => item.warehouse._id.toString() === warehouseId,
		);

		return {
			...response,
			stock: newStock,
		};
	}

	/**
	 * @description valida el inventario de un producto en una bodega
	 * @param productId producto a validart
	 * @param quantity cantidad a validar
	 * @param warehouseId bodega a validar
	 * @returns devuelve un producto
	 */
	async validateStock(
		productId: string,
		quantity: number,
		warehouseId: string,
	) {
		if (productId) {
			const product = await this.findById(productId, warehouseId);

			if (!product) {
				throw new NotFoundException(`El producto no existe`);
			}

			if (
				product?.stock.length <= 0 ||
				product?.stock[0]?.quantity < quantity
			) {
				throw new BadRequestException({
					message: `El producto ${product?.reference['name']}/${
						product?.barcode
					} no tiene suficientes unidades, stock: ${
						product?.stock[0]?.quantity || 0
					}`,
					data: product,
				});
			}

			return product;
		} else {
			throw new BadRequestException(`El id del producto no es válido`);
		}
	}

	/**
	 * @description se encarga de obtener los productos sin paginación, sin populate
	 * @param params datos pára filtrar la información
	 * @returns array de productos o vacío
	 */
	async getProducts(params: FiltersProductsInput) {
		const filters: FilterQuery<Product> = {};
		const { colorId, name, sizeId, status, ids } = params;

		if (ids) {
			filters._id = {
				$in: ids,
			};
		}

		if (colorId) {
			filters.color = colorId;
		}

		if (sizeId) {
			filters.size = sizeId;
		}

		if (StatusProduct[status]) {
			filters.status = StatusProduct[status];
		}

		const response = await this.referencesService.getReferences({ name });

		const references = response?.map((reference) => reference._id);

		if (references) {
			filters.reference = {
				$in: references,
			};
		}

		return this.productModel.find(filters).lean();
	}
}

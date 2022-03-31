import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';

import { WarehousesService } from 'src/shops/services/warehouses.service';
import { UsersService } from 'src/users/services/users.service';
import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-product.input';
import { Product } from '../entities/product.entity';
import { ProductMysql } from '../entities/product.entity';
import { ColorsService } from './colors.service';
import { ProvidersService } from './providers.service';
import { SizesService } from './sizes.service';

const populate = [
	{
		path: 'stock',
		populate: [
			{
				path: 'warehouse',
				model: 'Warehouse',
			},
		],
	},
	{ path: 'color', model: 'Color' },
	{ path: 'size', model: 'Size' },
	{ path: 'provider', model: 'Provider' },
];

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: PaginateModel<Product>,
		@InjectRepository(ProductMysql)
		private readonly productRepo: Repository<ProductMysql>,
		private readonly colorsService: ColorsService,
		private readonly sizesService: SizesService,
		private readonly providersService: ProvidersService,
		private readonly usersService: UsersService,
		private readonly warehousesService: WarehousesService,
	) {}

	async findAll(params: FiltersProductsInput) {
		const filters: FilterQuery<Product> = {};
		const {
			colorId,
			limit = 10,
			page = 1,
			name = '',
			sizeId,
			status,
			sort,
			ids,
			warehouseId,
		} = params;

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

		if (status) {
			filters.status = status;
		}

		const options = {
			limit,
			page: page,
			sort,
			lean: true,
			populate,
		};

		const response = await this.productModel.paginate(
			{
				...filters,
				$or: [
					{ barcode: name },
					{ description: { $regex: name, $options: 'i' } },
					{ reference: { $regex: name, $options: 'i' } },
				],
			},
			options,
		);

		const docs = response.docs.map((doc) => {
			if (warehouseId) {
				if (warehouseId === 'all') {
					return doc;
				}

				const stock = doc.stock.filter(
					(item) => item.warehouse._id.toString() === warehouseId,
				);

				return {
					...doc,
					stock,
				};
			}
			return {
				...doc,
				stock: [],
			};
		});
		return {
			...response,
			docs,
		};
	}

	async findOne({ warehouseId, ...params }: FiltersProductInput) {
		const product = await (
			await this.productModel.findOne(params)
		).populate(populate);

		if (warehouseId) {
			if (warehouseId === 'all') {
				return product;
			}

			const stock = product.stock.filter(
				(item) => item.warehouse._id.toString() === warehouseId,
			);

			return {
				...product['_doc'],
				stock,
			};
		}

		return {
			...product['_doc'],
			stock: [],
		};
	}

	async findById(id: string, warehouseId?: string) {
		const productQuery = await this.productModel.findById(id).lean();
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

	async migration() {
		try {
			const productsMysql = await this.productRepo.find();
			const warehouses = await this.warehousesService.findAll({});

			const productsMongo = [];

			const stock = warehouses?.docs.map((warehouse) => ({
				warehouse: warehouse._id,
				quantity: 100,
			}));

			for (let i = 0; i < productsMysql.length; i++) {
				const product = productsMysql[i];

				const color = await this.colorsService.getByIdMysql(product.color_id);
				const size = await this.sizesService.getByIdMysql(product.size_id);
				const provider = await this.providersService.getByIdMysql(
					product.provider_id,
				);
				const user = await this.usersService.getByIdMysql(
					product.owner_user_id,
				);

				productsMongo.push({
					reference: product.reference,
					description: product.description,
					barcode: product.barcode,
					changeable: product.changeable,
					color: color._id,
					size: size._id,
					provider: provider._id,
					price: product.price,
					cost: product.cost,
					status: product.state ? 'active' : 'inactive',
					user: user,
					shipping: {
						width: product.shipping_width,
						height: product.shipping_height,
						long: product.shipping_long,
						weight: product.shipping_weight,
						volume: product.shipping_volume,
					},
					stock,
					id: product.id,
				});
			}

			await this.productModel.create(productsMongo);
			return {
				message: 'Migración completa',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar productos ${e}`);
		}
	}

	/**
	 * @description se encarga de agregar unidades al inventario
	 * @param productId producto a agregar stock
	 * @param quantity cantidad de stock
	 * @param warehouseId bodega a agregar stock
	 * @returns si todo sale bien el producto actualizado
	 */
	async addStock(productId: string, quantity: number, warehouseId: string) {
		try {
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
		} catch (error) {
			return error;
		}
	}

	/**
	 * @description se encarga de eliminar unidades al inventario
	 * @param productId producto a eliminar stock
	 * @param quantity cantidad de stock
	 * @param warehouseId bodega a eliminar stock
	 * @returns si todo sale bien el producto actualizado
	 */
	async deleteStock(productId: string, quantity: number, warehouseId: string) {
		try {
			const product = await this.productModel.findById(productId).lean();

			if (!product) {
				throw new BadRequestException('El producto no existe');
			}

			const stockSelected = product.stock.find(
				(item) => item.warehouse._id.toString() === warehouseId,
			);
			if (stockSelected.quantity < quantity) {
				throw new BadRequestException(
					`Inventario insuficiente, stock ${stockSelected.quantity}`,
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
		} catch (error) {
			return error;
		}
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
		try {
			const product = await this.findById(productId, warehouseId);

			if (!product) {
				throw new NotFoundException(`El producto no existe`);
			}

			if (product?.stock[0]?.quantity < quantity) {
				throw new BadRequestException(
					`El producto ${product?.reference}/${product?.barcode} no tiene suficientes unidades, stock: ${product?.stock[0].quantity}`,
				);
			}

			return product;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @description se encarga de obtener los productos sin paginación, sin populate
	 * @param params datos pára filtrar la información
	 * @returns array de productos o vacío
	 */
	async getProducts(params: FiltersProductsInput) {
		const filters: FilterQuery<Product> = {};
		const { colorId, name = '', sizeId, status, ids } = params;

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

		if (status) {
			filters.status = status;
		}
		return this.productModel
			.find({
				...filters,
				$or: [
					{ barcode: name },
					{ description: { $regex: name, $options: 'i' } },
					{ reference: { $regex: name, $options: 'i' } },
				],
			})
			.lean();
	}
}

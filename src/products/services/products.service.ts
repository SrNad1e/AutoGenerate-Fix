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
import { SizesService } from './sizes.service';
import { ReferencesService } from './references.service';
import { BrandsService } from './brands.service';
import { CompaniesService } from './companies.service';
import { User } from 'src/users/entities/user.entity';

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
	{ path: 'reference', model: 'Reference' },
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
		private readonly usersService: UsersService,
		private readonly warehousesService: WarehousesService,
		private readonly referencesService: ReferencesService,
		private readonly brandsService: BrandsService,
		private readonly companiesService: CompaniesService,
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
		}: FiltersProductsInput,
		user: Partial<User>,
	) {
		const filters: FilterQuery<Product> = {};

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

		if (name) {
			const references = await this.referencesService.findAll(
				{
					name,
				},
				user,
			);
			filters.companies = {
				$in: references.docs.map((item) => item._id),
			};
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		const response = await this.productModel.paginate(
			{
				...filters,
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
		const product = await this.productModel.findOne(params).populate(populate);

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

	async migration() {
		try {
			const productsMysql = await this.productRepo.find();
			const warehouses = await this.warehousesService.findAll({});

			const productsMongo = [];

			const stock = warehouses?.docs.map((warehouse) => ({
				warehouse: warehouse._id,
				quantity: 100,
			}));

			const userDefault = await this.usersService.findOne('admin');

			for (let i = 0; i < productsMysql.length; i++) {
				const product = productsMysql[i];
				const color = await this.colorsService.getByIdMysql(product.color_id);
				const size = await this.sizesService.getByIdMysql(product.size_id);

				const user = await this.usersService.getByIdMysql(
					product.owner_user_id,
				);

				let reference = await this.referencesService.findOne({
					name: product.reference,
				});

				const brandSearch =
					product.provider_id === 1
						? 'Toulouse'
						: product.provider_id === 2
						? 'LuckyWoman'
						: 'Externos';
				let brand = await this.brandsService.findOne(brandSearch);
				const company = await this.companiesService.findOne('Cirotex');

				if (!brand) {
					await this.brandsService.create({ name: brandSearch }, user);
					brand = await this.brandsService.findOne(brandSearch);
				}

				if (!reference) {
					await this.referencesService.create(
						{
							name: product.reference,
							description: product.description,
							changeable: product.changeable,
							price: product.price,
							cost: product.cost,
							weight: product.shipping_weight,
							width: product.shipping_width,
							long: product.shipping_long,
							height: product.shipping_height,
							volume: product.shipping_volume,
							brandId: brand._id.toString(),
							companyId: company._id.toString(),
							categoryLevel1Id: '6256c4f3d1df9f6796b1a42d',
							categoryLevel2Id: '6256c530d1df9f6796b1a42e',
							categoryLevel3Id: '6256c54cd1df9f6796b1a42f',
						},
						userDefault,
					);

					reference = await this.referencesService.findOne({
						name: product.reference,
					});
				}
				productsMongo.push({
					reference: reference?._id,
					barcode: product.barcode,
					color: color._id,
					size: size._id,
					status: product.state ? 'active' : 'inactive',
					user: user,
					stock,
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
		const product = await this.productModel.findById(productId).lean();

		if (!product) {
			throw new BadRequestException('El producto no existe');
		}

		const stockSelected = product.stock.find(
			(item) => item.warehouse._id.toString() === warehouseId,
		);
		if (stockSelected?.quantity < quantity) {
			throw new BadRequestException(
				`Inventario insuficiente para el producto ${product.reference} / ${product.barcode}, stock ${stockSelected.quantity}`,
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

			if (product?.stock[0]?.quantity < quantity) {
				throw new BadRequestException(
					`El producto ${product?.reference}/${product?.barcode} no tiene suficientes unidades, stock: ${product?.stock[0].quantity}`,
				);
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

import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import {
	FilterQuery,
	PaginateModel,
	Types,
	AggregatePaginateModel,
	ProjectionType,
} from 'mongoose';
import { Repository } from 'typeorm';

import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-products.input';
import { Product, StatusProduct } from '../entities/product.entity';
import { ProductMysql } from '../entities/product.entity';
import { ColorsService } from './colors.service';
import { SizesService } from './sizes.service';
import { ReferencesService } from './references.service';
import { BrandsService } from './brands.service';
import { CreateProductInput } from '../dtos/create-product.input';
import { UpdateProductInput } from '../dtos/update-product.input';
import { CompaniesService } from 'src/configurations/services/companies.service';
import { Reference } from '../entities/reference.entity';
import { Size } from '../entities/size.entity';
import { Color } from '../entities/color.entity';
import { Image } from 'src/configurations/entities/image.entity';
import { UsersService } from 'src/configurations/services/users.service';
import { User } from 'src/configurations/entities/user.entity';
import { Warehouse } from 'src/configurations/entities/warehouse.entity';
import { WarehousesService } from 'src/configurations/services/warehouses.service';
import { CategoriesService } from './categories.service';

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
		@InjectModel(Image.name)
		private readonly imageModel: PaginateModel<Image>,
		@InjectRepository(ProductMysql)
		private readonly productRepo: Repository<ProductMysql>,
		private readonly colorsService: ColorsService,
		private readonly sizesService: SizesService,
		private readonly usersService: UsersService,
		private readonly warehousesService: WarehousesService,
		private readonly referencesService: ReferencesService,
		private readonly brandsService: BrandsService,
		private readonly companiesService: CompaniesService,
		private readonly categoriesService: CategoriesService,
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
			filters.color = colorId;
		}

		if (sizeId) {
			filters.size = sizeId;
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

		return (
			await this.productModel.create({
				reference: reference?._id,
				color: color?._id,
				size: size?._id,
				images: imagesId?.map((id) => new Types.ObjectId(id)),
				barcode,
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

	async migration() {
		try {
			const productsMysql = await this.productRepo.find();
			const warehouses = await this.warehousesService.findAll(
				{
					limit: 100,
				},
				{
					username: 'admin',
				},
				'',
			);

			const productsMongo = [];

			const stock = warehouses?.docs.map((warehouse) => ({
				warehouse: warehouse._id,
				quantity: 100,
			}));

			const userDefault = await this.usersService.findOne({
				username: 'admin',
			});

			for (let i = 0; i < productsMysql?.length; i++) {
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
					const categoryMysql = await this.categoriesService.getByIdMysql(
						product.category_id,
					);

					let category = await this.categoriesService.findOne({
						name: categoryMysql?.name,
					});

					if (category?.level === 3) {
						category = await this.categoriesService.findOne({
							name: 'Otros',
						});
					}

					let categoryLevel1Id;
					let categoryLevel2Id;
					let categoryLevel3Id;

					if (category?.level === 1) {
						categoryLevel1Id = category?.data?._id;
					}

					if (category?.level === 2) {
						categoryLevel1Id = category?.data['parentId'];
						categoryLevel2Id = category?.data?._id;
					}

					await this.referencesService.create(
						{
							name: product.reference,
							description: product.description,
							changeable: product.changeable,
							price: product.price,
							cost: product.cost,
							weight: parseFloat(product?.shipping_weight?.toString() || '0'),
							width: parseFloat(product.shipping_width?.toString() || '0'),
							long: parseFloat(product.shipping_long?.toString() || '0'),
							height: parseFloat(product.shipping_height?.toString() || '0'),
							volume: parseFloat(product.shipping_volume?.toString() || '0'),
							brandId: brand._id.toString(),
							categoryLevel1Id,
							categoryLevel2Id,
							categoryLevel3Id,
							attribIds: [],
						},
						userDefault,
						company._id.toString(),
					);

					reference = await this.referencesService.findOne({
						name: product.reference,
					});
				}

				const imagesMysql = JSON.parse(product.images);

				const images = [];

				if (imagesMysql) {
					for (let i = 0; i < imagesMysql?.length; i++) {
						const { imageSizes, alt } = imagesMysql[i];
						const { webp, jpg } = imageSizes;

						const image = await this.imageModel.findOne({
							'urls.original': jpg?.S400x578.split('/')[7],
						});
						if (!image) {
							const newImage = new this.imageModel({
								name: alt,
								user: userDefault,
								urls: {
									webp: {
										small: webp?.S150x217.split('/')[7],
										medium: webp?.S200x289.split('/')[7],
										big: webp?.S900x1300.split('/')[7],
									},
									jpeg: {
										small: jpg?.S150x217.split('/')[7],
										medium: jpg?.S200x289.split('/')[7],
										big: jpg?.S900x1300.split('/')[7],
									},
									original: jpg?.S400x578.split('/')[7],
								},
							});
							const { _id } = await newImage.save();
							images.push(_id);
						} else {
							images.push(image._id);
						}
					}
				}

				productsMongo.push({
					reference: reference?._id,
					barcode: product.barcode,
					color: color._id,
					size: size._id,
					status: product.state ? StatusProduct.ACTIVE : StatusProduct.INACTIVE,
					user: user,
					stock,
					images,
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
				throw new BadRequestException(
					`El producto ${product?.reference['name']}/${
						product?.barcode
					} no tiene suficientes unidades, stock: ${
						product?.stock[0]?.quantity || 0
					}`,
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

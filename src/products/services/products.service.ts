import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { Repository } from 'typeorm';

import { WarehousesService } from 'src/shops/services/warehouses.service';
import { UsersService } from 'src/users/services/users.service';
import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-products.input';
import { Product } from '../entities/product.entity';
import { ProductMysql } from '../entities/product.entity';
import { ColorsService } from './colors.service';
import { SizesService } from './sizes.service';
import { ReferencesService } from './references.service';
import { BrandsService } from './brands.service';
import { User } from 'src/users/entities/user.entity';
import { CreateProductInput } from '../dtos/create-product.input';
import { UpdateProductInput } from '../dtos/update-product.input';
import { CompaniesService } from 'src/configurations/services/companies.service';
import { Reference } from '../entities/reference.entity';
import { Size } from '../entities/size.entity';
import { Color } from '../entities/color.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { Image } from 'src/staticfiles/entities/image.entity';

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

const statusTypes = ['active', 'inactive'];

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: PaginateModel<Product>,
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

			filters.reference = {
				$in: references.docs.map((item) => item._id),
			};
		}

		if (referenceId) {
			filters.reference = new Types.ObjectId(referenceId);
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

				const stock = doc.stock?.filter(
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

	async create(props: CreateProductInput, user: User) {
		const reference = await this.referencesService.findById(
			props.referenceId,
			user,
		);
		if (!reference) {
			throw new NotFoundException('La referencia no existe');
		}

		const product = await this.findOne({
			size: props.sizeId,
			color: props.colorId,
			reference: props.referenceId,
		});

		if (product) {
			throw new NotFoundException(
				`La combianción de talla y color ya existe para la referencia ${reference.name}`,
			);
		}

		const color = await this.colorsService.findById(props.colorId);

		if (!color) {
			throw new NotFoundException('El color no existe');
		}

		const size = await this.sizesService.findById(props.colorId);

		if (!size) {
			throw new NotFoundException('La talla no existe');
		}

		const products = await this.findAll({}, user);
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
		const newProduct = new this.productModel({ ...props, barcode, user });

		return (await newProduct.save()).populate(populate);
	}

	async update(id: string, props: UpdateProductInput, user: User) {
		const product = await this.productModel.findById(id).lean();

		if (!product) {
			throw new NotFoundException('El producto no existe');
		}
		const color = await this.colorsService.findById(props.colorId);

		if (!color) {
			throw new NotFoundException('El color no existe');
		}

		const size = await this.sizesService.findById(props.colorId);

		if (!size) {
			throw new NotFoundException('La talla no existe');
		}

		if (!statusTypes.includes(props.status)) {
			throw new NotFoundException(`El estado ${props.status} no es válido`);
		}

		const productCodeBar = await this.findOne({ barcode: props.barcode });

		if (productCodeBar) {
			throw new NotFoundException(
				`El código de barras ${props.barcode}, está asignada al producto ${productCodeBar.reference.name} / ${productCodeBar.color.name} - ${productCodeBar.size.value}  `,
			);
		}

		return this.productModel.findByIdAndUpdate(id, {
			$set: { ...props, user },
		});
	}

	async migration() {
		try {
			const productsMysql = await this.productRepo.find();
			const warehouses = await this.warehousesService.findAll(
				{},
				{
					username: 'admin',
				},
			);

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
							categoryLevel1Id: '6267e450874de734057c37ff',
							categoryLevel2Id: '6267e47e874de734057c3800',
							categoryLevel3Id: '6267e497874de734057c3801',
						},
						userDefault,
					);

					reference = await this.referencesService.findOne({
						name: product.reference,
					});
				}

				const imagesMysql = JSON.parse(product.images);

				const images = [];

				for (let i = 0; i < imagesMysql.length; i++) {
					const { imageSizes, alt } = imagesMysql[i];
					const { webp, jpg } = imageSizes;
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
				}

				productsMongo.push({
					reference: reference?._id,
					barcode: product.barcode,
					color: color._id,
					size: size._id,
					status: product.state ? 'active' : 'inactive',
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

import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model, PaginateModel, Types } from 'mongoose';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';
import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-product.input';

import { Product } from '../entities/product.entity';
import { ProductMysql } from '../entities/product.entity';
import { ColorsService } from './colors.service';
import { ProvidersService } from './providers.service';
import { SizesService } from './sizes.service';

const populate = ['color', 'size', 'provider'];

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: Model<Product> & PaginateModel<Product>,
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
			skip = 0,
			name = '',
			sizeId,
			status,
			sort,
			ids,
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
			page: skip,
			sort,
			lean: true,
			populate,
		};

		return this.productModel.paginate(
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
	}

	async findOne(params: FiltersProductInput): Promise<Product> {
		return (await this.productModel.findOne(params)).populate(populate);
	}

	async findById(id: Types.ObjectId) {
		return this.productModel.findById(id);
	}

	async migration() {
		try {
			const productsMysql = await this.productRepo.find();
			const warehouses = await this.warehousesService.findAll({});

			const productsMongo = [];

			const stock = warehouses?.map((warehouse) => ({
				warehouse: warehouse._id,
				quantity: 0,
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
	 * @param warehouseId bodega a agrear stock
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

			return this.productModel.findByIdAndUpdate(
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
		} catch (error) {
			return error;
		}
	}
}

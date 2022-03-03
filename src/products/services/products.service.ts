/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model, ObjectId } from 'mongoose';
import { UsersService } from 'src/users/services/users.service';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { ProductMysql } from '../entities/product.entity';
import { ColorsService } from './colors.service';
import { ProvidersService } from './providers.service';
import { SizesService } from './sizes.service';

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name) private readonly productModel: Model<Product>,
		@InjectRepository(ProductMysql)
		private readonly productRepo: Repository<ProductMysql>,
		private readonly colorsService: ColorsService,
		private readonly sizesService: SizesService,
		private readonly providersService: ProvidersService,
		private readonly usersService: UsersService,
	) {}

	/**
	 * @description obtiene el producto con base al id de mysql
	 * @param id identificador del producto en mysql
	 */
	async getProductsIdSql(ids: ObjectId[]) {
		return await this.productModel.find({ id: { $in: ids } });
	}

	async migration() {
		try {
			const productsMysql = await this.productRepo.find();

			const productsMongo = productsMysql.map(async (product) => {
				const color = await this.colorsService.getByIdMysql(product.color_id);
				const size = await this.sizesService.getByIdMysql(product.size_id);
				const provider = await this.providersService.getByIdMysql(
					product.provider_id,
				);
				const user = await this.usersService.getByIdMysql(
					product.owener_user_id,
				);

				return {
					reference: product.reference,
					description: product.description,
					barcode: product.barcode,
					changeable: product.changeable,
					color: color._id,
					size: size._id,
					provider: provider._id,
					price: product.price,
					cost: product.cost,
					state: product.state ? 'Active' : 'Inactive',
					user: user._id,
					shipping: {
						width: product.shipping_width,
						height: product.shipping_weigth,
						long: product.shipping_long,
						weight: product.shipping_weigth,
						volume: product.shipping_volume,
					},
					id: product.id,
				};
			});

			await this.productModel.create(productsMongo);
			return {
				message: 'Migración completa',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar productos ${e}`);
		}
	}
}

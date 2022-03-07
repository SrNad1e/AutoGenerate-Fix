import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model, PaginateModel, Types } from 'mongoose';
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
		} = params;

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
			populate,
		};

		console.log(name);

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

			const productsMongo = [];

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
					status: product.state ? 'Active' : 'Inactive',
					user: user,
					shipping: {
						width: product.shipping_width,
						height: product.shipping_height,
						long: product.shipping_long,
						weight: product.shipping_weight,
						volume: product.shipping_volume,
					},
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
}

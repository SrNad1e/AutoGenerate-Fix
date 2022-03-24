/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model } from 'mongoose';
import { Repository } from 'typeorm';

import {
	CreateShopParamsDto,
	FilterShopsDto,
	UpdateShopParamsDto,
} from '../dtos/shop.dto';
import { Shop } from '../entities/shop.entity';
import { Shop as ShopMysql } from '../entities/shopMysql.entity';

const populate = [
	{
		path: 'defaultWarehouse',
		model: 'Warehouse'
	},
	{
		path: 'warehouseMain',
		model: 'Warehouse'	
	}
];

@Injectable()
export class ShopsService {
	constructor(
		@InjectModel(Shop.name) private shopModel: Model<Shop>,
		@InjectRepository(ShopMysql) private shopMysqlRepo: Repository<ShopMysql>,
	) {}

	async getAll(params: FilterShopsDto) {
		const filters: FilterQuery<Shop> = {};
		const { limit = 20, page = 1, name, status, sort } = params;

		if (name) {
			filters['name'] = { $regex: name, $options: 'i' };
		}

		if (status) {
			filters.status = status;
		}

		const result = await this.shopModel
			.find(filters)
			.limit(limit)
			.skip(page)
			.sort(sort)
			.exec();

		return {
			data: result,
			total: result?.length,
			limit,
			page,
		};
	}

	async getByIdMysql(shopId: number) {
		return await this.shopModel.findOne({ shopId });
	}

	async findById(shopId: string) {
		return this.shopModel.findById(shopId);
	}

	async create(params: CreateShopParamsDto) {
		const newShop = new this.shopModel(params);
		return newShop.save();
	}

	async update(id: string, params: UpdateShopParamsDto) {
		return this.shopModel.findByIdAndUpdate(id, params, { new: true });
	}

	async migrate() {
		try {
			//consultamos las tiendas
			const shopsMysql = await this.shopMysqlRepo.find();

			//guardamos las tiendas
			for (let i = 0; i < shopsMysql.length; i++) {
				const shopMysql = shopsMysql[i];
				const newShop = new this.shopModel({
					name: shopMysql.name,
					address: shopMysql.address,
					phone: shopMysql.phone,
					shopId: shopMysql.id,
					createdAt: shopMysql.created_at,
				});
				await newShop.save();
			}

			return {
				message: 'Migración completa',
			};
		} catch (e) {
			return new NotFoundException(`Error al realizar la migración ${e}`);
		}
	}
}

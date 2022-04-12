import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';

import {
	CreateShopParamsDto,
	FilterShopsDto,
	UpdateShopParamsDto,
} from '../dtos/shop.dto';
import { Shop } from '../entities/shop.entity';
import { Shop as ShopMysql } from '../entities/shopMysql.entity';
import { Warehouse } from '../entities/warehouse.entity';

const populate = [
	{
		path: 'defaultWarehouse',
		model: Warehouse.name,
	},
	{
		path: 'warehouseMain',
		model: Warehouse.name,
	},
];

@Injectable()
export class ShopsService {
	constructor(
		@InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
		@InjectRepository(ShopMysql)
		private readonly shopMysqlRepo: Repository<ShopMysql>,
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: PaginateModel<Warehouse>,
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
		return await this.shopModel.findById(shopId).populate(populate).lean();
	}

	async create(params: CreateShopParamsDto) {
		const newShop = new this.shopModel(params);
		return newShop.save();
	}

	async update(id: string, params: UpdateShopParamsDto) {
		return this.shopModel.findByIdAndUpdate(id, params, { new: true });
	}

	/**
	 * @description se encarga de consultar la tienda mayorista
	 * @returns tienda mayorista
	 */
	async getShopWholesale() {
		try {
			return this.shopModel.findOne({ isWholesale: true }).lean();
		} catch (error) {
			return error;
		}
	}

	async migrate() {
		try {
			const shopsMysql = await this.shopMysqlRepo.find();

			for (let i = 0; i < shopsMysql.length; i++) {
				const shopMysql = shopsMysql[i];

				const defaultWarehouse = await this.warehouseModel
					.findOne({
						name: shopMysql.name,
					})
					.lean();

				const newShop = new this.shopModel({
					name: shopMysql.name,
					address: shopMysql.address,
					phone: shopMysql.phone,
					shopId: shopMysql.id,
					defaultWarehouse: defaultWarehouse?._id,
					createdAt: shopMysql.created_at,
					user: {
						name: 'Migración',
					},
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

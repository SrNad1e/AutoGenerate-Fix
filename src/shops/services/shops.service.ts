import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { CompaniesService } from 'src/configurations/services/companies.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateShopInput } from '../dtos/create-shop.input';
import { FiltersShopInput } from '../dtos/filters-shop.input';
import { FiltersShopsInput } from '../dtos/filters-shops.input';
import { UpdateShopInput } from '../dtos/update-shop.input';

import { Shop, ShopMysql } from '../entities/shop.entity';
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
		@InjectModel(Shop.name) private readonly shopModel: PaginateModel<Shop>,
		@InjectRepository(ShopMysql)
		private readonly shopMysqlRepo: Repository<ShopMysql>,
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: PaginateModel<Warehouse>,
		private readonly companiesService: CompaniesService,
	) {}

	async getAll(params: FiltersShopsInput, user: User, companyId: string) {
		const filters: FilterQuery<Shop> = {};
		const { limit = 20, page = 1, name, status, sort } = params;

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (name) {
			filters['name'] = { $regex: name, $options: 'i' };
		}

		if (status) {
			filters.status = status;
		}

		const options: PaginateOptions = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		return this.shopModel.paginate(filters, options);
	}

	async findById(shopId: string) {
		return this.shopModel.findById(shopId).populate(populate).lean();
	}

	async findOne(filters: FiltersShopInput) {
		return this.shopModel.findOne(filters).lean();
	}

	async create(params: CreateShopInput) {
		const newShop = new this.shopModel(params);
		return newShop.save();
	}

	async update(
		id: string,
		{
			defaultWarehouseId,
			companyId,
			warehouseMainId,
			...props
		}: UpdateShopInput,
	) {
		const params: Partial<Shop> = {
			...props,
		};

		if (defaultWarehouseId) {
			const defaultWarehouse = await this.warehouseModel.findById(
				defaultWarehouseId,
			);

			if (!defaultWarehouse) {
				throw new NotFoundException('La bodega por defecto no exite');
			}
			params.defaultWarehouse = new Types.ObjectId(defaultWarehouseId);
		}

		if (warehouseMainId) {
			const warehouseMain = await this.warehouseModel.findById(warehouseMainId);

			if (!warehouseMain) {
				throw new NotFoundException('La bodega principal');
			}
			params.warehouseMain = new Types.ObjectId(warehouseMainId);
		}

		if (companyId) {
			const company = await this.companiesService.findById(companyId);

			if (!company) {
				throw new NotFoundException('La empresa no existe');
			}
			params.company = new Types.ObjectId(companyId);
		}

		return this.shopModel.findByIdAndUpdate(
			id,
			{ $set: params },
			{
				new: true,
				lean: true,
				populate,
			},
		);
	}

	/**
	 * @description se encarga de consultar la tienda por id de mysql
	 * @param shopId identificador de la tienda
	 * @returns tienda
	 */
	async getByIdMysql(shopId: number) {
		return this.shopModel.findOne({ shopId }).populate(populate).lean();
	}

	/**
	 * @description se encarga de consultar la tienda mayorista
	 * @returns tienda mayorista
	 */
	async getShopWholesale() {
		return this.shopModel
			.findOne({ name: 'Mayoristas' })
			.populate(populate)
			.lean();
	}

	async migrate() {
		try {
			const shopsMysql = await this.shopMysqlRepo.find();
			const companyDefault = await this.companiesService.findOne('Cirotex');

			for (let i = 0; i < shopsMysql.length; i++) {
				const shopMysql = shopsMysql[i];

				const defaultWarehouse = await this.warehouseModel
					.findOne({
						name: shopMysql.name,
					})
					.lean();
				if (defaultWarehouse) {
					const newShop = new this.shopModel({
						name: shopMysql.name,
						address: shopMysql.address,
						phone: shopMysql.phone,
						shopId: shopMysql.id,
						defaultWarehouse: defaultWarehouse?._id,
						company: companyDefault._id,
						createdAt: shopMysql.created_at,
						user: {
							name: 'Administrador del Sistema',
							username: 'admin',
						},
					});
					await newShop.save();
				}
			}

			return {
				message: 'Migración completa',
			};
		} catch (e) {
			return new NotFoundException(`Error al realizar la migración ${e}`);
		}
	}
}

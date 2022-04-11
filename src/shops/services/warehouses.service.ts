import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';

import { FiltersWarehouseInput } from '../dtos/filters-warehouse.input';
import { Warehouse, WarehouseMysql } from '../entities/warehouse.entity';
import { ShopsService } from './shops.service';

@Injectable()
export class WarehousesService {
	constructor(
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: PaginateModel<Warehouse>,
		@InjectRepository(WarehouseMysql)
		private readonly warehouseRepo: Repository<WarehouseMysql>,
		private readonly shopsService: ShopsService,
	) {}

	async findAll({
		name = '',
		limit = 10,
		page = 1,
		sort,
		...params
	}: FiltersWarehouseInput) {
		const filters: FilterQuery<Warehouse> = {
			name: { $regex: name, $options: 'i' },
			...params,
		};

		const options = {
			limit,
			page: page,
			sort,
			lean: true,
		};

		return this.warehouseModel.paginate(filters, options);
	}

	async findOne(params: FiltersWarehouseInput) {
		return this.warehouseModel.findOne(params).lean();
	}

	/**
	 * @description obtiene una bodega con base al id de mysql
	 * @param id identificador en la base de datos mysql
	 * @returns objeto tipo warehouse
	 */
	async getByIdMysql(id: number): Promise<Warehouse> {
		return this.warehouseModel.findOne({ id }).lean();
	}

	async findById(id: string) {
		return this.warehouseModel.findById(id);
	}

	async migrate() {
		try {
			const warehousesMysql = await this.warehouseRepo.find();
			const warehousesMongo = [];
			for (let i = 0; i < warehousesMysql.length; i++) {
				const { shop_id, id, name } = warehousesMysql[i];
				const shop = await this.shopsService.getByIdMysql(shop_id);
				warehousesMongo.push({
					id,
					name,
					shop,
					max: 100,
					min: 10,
					user: {
						id: 0,
						name: 'Usuario de migración',
						username: 'migrate',
					},
				});
			}
			await this.warehouseModel.create(warehousesMongo);
			return {
				message: 'Migración completa',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar las bodegas ${e}`);
		}
	}
}

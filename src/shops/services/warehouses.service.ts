import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model, Types } from 'mongoose';
import { Repository } from 'typeorm';
import { FiltersWarehouseInput } from '../dtos/filters-warehouse.input';
import { Warehouse, WarehouseMysql } from '../entities/warehouse.entity';
import { ShopsService } from './shops.service';

@Injectable()
export class WarehousesService {
	constructor(
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: Model<Warehouse>,
		@InjectRepository(WarehouseMysql)
		private readonly warehouseRepo: Repository<WarehouseMysql>,
		private readonly shopsService: ShopsService,
	) {}

	async findAll(props: FiltersWarehouseInput): Promise<Partial<Warehouse[]>> {
		const { name = '', ...params } = props;
		return this.warehouseModel
			.find({ name: { $regex: name, $options: 'i' }, ...params })
			.lean();
	}

	/**
	 * @description obtiene una bodega con base al id de mysql
	 * @param id identificador en la base de datos mysql
	 * @returns objeto tipo warehouse
	 */
	async getByIdMysql(id: number): Promise<Warehouse> {
		return this.warehouseModel.findOne({ id }).lean();
	}

	async findById(id: Types.ObjectId) {
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

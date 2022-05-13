import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { CompaniesService } from 'src/configurations/services/companies.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { FiltersWarehousesInput } from '../dtos/filters-warehouses.input';
import { Warehouse, WarehouseMysql } from '../entities/warehouse.entity';

@Injectable()
export class WarehousesService {
	constructor(
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: PaginateModel<Warehouse>,
		@InjectRepository(WarehouseMysql)
		private readonly warehouseRepo: Repository<WarehouseMysql>,
		private readonly companiesService: CompaniesService,
	) {}

	async findAll(
		{
			name,
			limit = 10,
			page = 1,
			sort,
			active,
			isMain,
		}: FiltersWarehousesInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<Warehouse> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (name) {
			filters.name = { $regex: name, $options: 'i' };
		}

		if (active !== undefined) {
			filters.active = active;
		}

		if (isMain !== undefined) {
			filters.isMain = isMain;
		}

		const options = {
			limit,
			page: page,
			sort,
			lean: true,
		};

		return this.warehouseModel.paginate(filters, options);
	}

	async getAll() {
		return this.warehouseModel.find().lean();
	}

	async findOne(params: FiltersWarehousesInput) {
		return this.warehouseModel.findOne(params).lean();
	}

	async findById(id: string) {
		return this.warehouseModel.findById(id).lean();
	}

	/**
	 * @description obtiene una bodega con base al id de mysql
	 * @param id identificador en la base de datos mysql
	 * @returns objeto tipo warehouse
	 */
	async getByIdMysql(id: number): Promise<Warehouse> {
		return this.warehouseModel.findOne({ id }).lean();
	}

	async migrate() {
		try {
			const warehousesMysql = await this.warehouseRepo.find();
			const companyDefault = await this.companiesService.findOne('Cirotex');
			const warehousesMongo = [];
			for (let i = 0; i < warehousesMysql.length; i++) {
				const { name } = warehousesMysql[i];
				warehousesMongo.push({
					name,
					max: 100,
					min: 10,
					company: companyDefault?._id,
					user: {
						name: 'Administrador del Sistema',
						username: 'admin',
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

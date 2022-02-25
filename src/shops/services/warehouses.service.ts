import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FiltersWarehouseInput } from '../dtos/filters-warehouse.input';
import { Warehouse } from '../entities/warehouse.entity';

@Injectable()
export class WarehouseService {
	constructor(
		@InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
	) {}

	async findAll(props: FiltersWarehouseInput): Promise<Partial<Warehouse>> {
		const { name = '' } = props;
		return this.warehouseModel
			.find({ name: { $regex: name, $options: 'i' } })
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
}

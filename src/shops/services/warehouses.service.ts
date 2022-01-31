import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Warehouse } from '../entities/warehouse.entity';

@Injectable()
export class WarehouseService {
	constructor(
		@InjectModel(Warehouse.name) private warehouseModel: Model<Warehouse>,
	) {}

	/**
	 * @description obtiene una bodega con base al id de mysql
	 * @param id identificador en la base de datos mysql
	 * @returns objeto tipo warehouse
	 */
	getByIdMysql(id: number) {
		return this.warehouseModel.findOne({ id });
	}
}

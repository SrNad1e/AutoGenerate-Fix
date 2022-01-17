/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehouseService } from './services/warehouses.service';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';
@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Warehouse.name,
				schema: WarehouseSchema,
			},
		]),
	],
	providers: [WarehouseService],
	exports: [WarehouseService],
})
export class ShopsModule {}

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WarehousesService } from './services/warehouses.service';
import {
	Warehouse,
	WarehouseMysql,
	WarehouseSchema,
} from './entities/warehouse.entity';
import { ShopsService } from './services/shops.service';
import { ShopsController } from './controllers/shops.controller';
import { Shop, ShopMysql, ShopSchema } from './entities/shop.entity';
import { WarehousesResolver } from './resolvers/warehouses.resolver';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { ShopsResolver } from './resolvers/shops.resolver';
@Module({
	imports: [
		ConfigurationsModule,
		MongooseModule.forFeature([
			{
				name: Warehouse.name,
				schema: WarehouseSchema,
			},
			{
				name: Shop.name,
				schema: ShopSchema,
			},
		]),
		TypeOrmModule.forFeature([ShopMysql, WarehouseMysql]),
	],
	controllers: [ShopsController],
	providers: [
		ShopsService,
		WarehousesService,
		WarehousesResolver,
		ShopsResolver,
	],
	exports: [ShopsService, WarehousesService],
})
export class ShopsModule {}

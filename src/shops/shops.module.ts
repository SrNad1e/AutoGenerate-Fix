/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WarehouseService } from './services/warehouses.service';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';
import { ShopsService } from './services/shops.service';
import { ShopsController } from './controllers/shops.controller';
import { Shop as ShopMysql } from './entities/shopMysql.entity';
import { Shop, ShopSchema } from './entities/shop.entity';
import { UsersModule } from 'src/users/users.module';
@Module({
	imports: [
		UsersModule,
		MongooseModule.forFeature([
			{
				name: Warehouse.name,
				schema: WarehouseSchema,
			},
			{ name: Shop.name, schema: ShopSchema },
		]),
		TypeOrmModule.forFeature([ShopMysql]),
	],
	controllers: [ShopsController],
	providers: [ShopsService, WarehouseService],
	exports: [ShopsService, WarehouseService],
})
export class ShopsModule {}

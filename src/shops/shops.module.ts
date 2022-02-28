/* eslint-disable @typescript-eslint/no-var-requires */
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
import { WarehousesResolver } from './resolvers/warehouses.resolver';
@Module({
	imports: [
		UsersModule,
		MongooseModule.forFeature([
			{
				name: Warehouse.name,
				schema: WarehouseSchema,
			},
		]),
		MongooseModule.forFeatureAsync([
			{
				name: Shop.name,
				useFactory: () => {
					const schema = ShopSchema;
					schema.pre('find', (next) => {
						if (typeof this === 'object') {
						//	this?.populate('warehouse');
						}
						next();
					});
					schema.pre('findOne', () => {
						const context = this || undefined;
						context && context.populate('warehouse');
					});
					schema.pre('findOById', () => {
						const context = this || undefined;
						context && context.populate('warehouse');
					});
					return schema;
				},
			},
		]),
		TypeOrmModule.forFeature([ShopMysql]),
	],
	controllers: [ShopsController],
	providers: [ShopsService, WarehouseService, WarehousesResolver],
	exports: [ShopsService, WarehouseService],
})
export class ShopsModule {}

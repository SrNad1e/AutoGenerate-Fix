import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from 'src/config';
//import { ProductMysql } from 'src/products/entities/product.entity';
//import { ColorMysql } from 'src/products/entities/color.entity';
//import { SizeMysql } from 'src/products/entities/size.entity';
import {
	StockTransferDetailMysql,
	StockTransferMysql,
} from 'src/inventories/entities/stock-transfer.entity';
//import { UserMysql } from 'src/configurations/entities/user.entity';
//import { ShopMysql } from 'src/configurations/entities/shop.entity';
//import { WarehouseMysql } from 'src/configurations/entities/warehouse.entity';
//import { CategoryMysql } from 'src/products/entities/category-level1.entity';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { connection, host, port, dbName, user, password } =
					configService.mongo;
				return {
					uri: `${connection}://${host}`,
					dbName,
					user,
					pass: password,
					retryWrites: true,
					w: 'majority',
					connectionFactory: (connection) => {
						connection.plugin(require('mongoose-paginate-v2'));
						connection.plugin(require('mongoose-aggregate-paginate-v2'));
						return connection;
					},
				};
			},
			inject: [config.KEY],
		}),
		/*	TypeOrmModule.forRootAsync({
			inject: [config.KEY],
			useFactory: (configService: ConfigType<typeof config>) => {
				const { user, password, port, dbName, host } = configService.mariadb;
				return {
					type: 'mariadb',
					host,
					port,
					username: user,
					password,
					database: dbName,
					entities: [
						ProductMysql,
						StockTransferDetailMysql,
						StockTransferMysql,
						ShopMysql,
						UserMysql,
						ColorMysql,
						SizeMysql,
						WarehouseMysql,
						CategoryMysql,
					],
				};
			},
		}),*/
	],
	providers: [],
	//exports: [TypeOrmModule],
})
export class DatabasesModule {}

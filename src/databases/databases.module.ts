/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from 'src/config';
import { Inventories } from 'src/inventories/entities/inventories.entity';
import { ProductMysql } from 'src/products/entities/product.migration.entity';
import { Shop as ShopMysql } from 'src/shops/entities/shopMysql.entity';
import { StockTransferDetailMysql } from 'src/inventories/entities/stock-transfer-detail.migrate.entity';
import { StockTransferMysql } from 'src/inventories/entities/stock-transfer.migrate.entity';
import { User } from 'src/users/entities/user.entity';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { connection, host, port, dbName } = configService.mongo;
				return {
					uri: `${connection}://${host}:${port}`,
					dbName,
				};
			},
			inject: [config.KEY],
		}),
		TypeOrmModule.forRootAsync({
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
						Inventories,
						ProductMysql,
						StockTransferDetailMysql,
						StockTransferMysql,
						ShopMysql,
						User,
					],
				};
			},
		}),
	],
	providers: [],
	exports: [TypeOrmModule],
})
export class DatabasesModule {}

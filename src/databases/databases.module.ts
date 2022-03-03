/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from 'src/config';
import { Inventories } from 'src/inventories/entities/inventories.entity';
import { ProductMysql } from 'src/products/entities/product.entity';
import { Shop as ShopMysql } from 'src/shops/entities/shopMysql.entity';
import { StockTransferDetailMysql } from 'src/inventories/entities/stock-transfer-detail.migrate.entity';
import { StockTransferMysql } from 'src/inventories/entities/stock-transfer.migrate.entity';
import { UserMysql } from 'src/users/entities/user.entity';
import { InvoiceMysql } from 'src/invoices/entities/invoice.entity';
import { ColorMysql } from 'src/products/entities/color.entity';
import { SizeMysql } from 'src/products/entities/size.entity';
import { ProviderMysql } from 'src/products/entities/provider.entity';

@Global()
@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigType<typeof config>) => {
				const { connection, host, port, dbName, user, password } =
					configService.mongo;
				return {
					uri: `${connection}://${host}:${port}`,
					dbName,
					user,
					pass: password,
					retryWrites: true,
					w: 'majority',
					connectionFactory: (connection) => {
						connection.plugin(require('mongoose-paginate-v2'));
						return connection;
					},
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
						UserMysql,
						InvoiceMysql,
						ColorMysql,
						SizeMysql,
						ProviderMysql,
					],
				};
			},
		}),
	],
	providers: [],
	exports: [TypeOrmModule],
})
export class DatabasesModule {}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { InvoicesModule } from './invoices/invoices.module';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { enviroments } from './enviroments';
import { DatabasesModule } from './databases/databases.module';
import { ShippingsModule } from './shippings/shippings.module';
import { TreasuryModule } from './treasury/treasury.module';
import { ConfigsModule } from './configs/configs.module';
import { InventoriesModule } from './inventories/inventories.module';
import { StockTransferModule } from './stock-transfer/stock-transfer.module';
import { ImagesModule } from './images/images.module';
import config from './config';
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: enviroments[process.env.NODE_ENV] || '.env',
			load: [config],
			isGlobal: true,
			validationSchema: Joi.object({
				MONGO_DB: Joi.string().required(),
				MONGO_PORT: Joi.number().required(),
				//	MONGO_USER: Joi.string().required(),
				//	MONGO_PASSWORD: Joi.string().required(),
				MONGO_HOST: Joi.string().required(),
				MONGO_CONNECTION: Joi.string().required(),
				PORT: Joi.number().required(),
				MARIADB_DB: Joi.string().required(),
				MARIADB_USER: Joi.string().required(),
				MARIADB_PASSWORD: Joi.string().required(),
				MARIADB_PORT: Joi.number().required(),
				MARIADB_HOST: Joi.string().required(),
			}),
		}),
		InvoicesModule,
		CouponsModule,
		CustomersModule,
		ShopsModule,
		UsersModule,
		ProductsModule,
		DatabasesModule,
		ShippingsModule,
		TreasuryModule,
		ConfigsModule,
		InventoriesModule,
		StockTransferModule,
		ImagesModule,
	],
})
export class AppModule {}

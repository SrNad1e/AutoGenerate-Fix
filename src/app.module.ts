/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';

import config from './config';
import { ConfigurationsModule } from './configurations/configurations.module';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { DatabasesModule } from './databases/databases.module';
import { enviroments } from './enviroments';
import { ImagesModule } from './images/images.module';
import { InventoriesModule } from './inventories/inventories.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { ShippingsModule } from './shippings/shippings.module';
import { ShopsModule } from './shops/shops.module';
import { TreasuryModule } from './treasury/treasury.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './app.gateway';
@Module({
	imports: [
		GraphQLModule.forRoot({
			autoSchemaFile: 'src/schema.gql',
			sortSchema: true,
		}),
		ConfigModule.forRoot({
			envFilePath: enviroments[process.env.NODE_ENV] || '.env',
			load: [config],
			isGlobal: true,
			validationSchema: Joi.object({
				MONGO_DB: Joi.string().required(),
				MONGO_PORT: Joi.number().required(),
				//MONGO_PASSWORD: Joi.string().required(),
				//MONGO_USER: Joi.string().required(),
				MONGO_HOST: Joi.string().required(),
				MONGO_CONNECTION: Joi.string().required(),
				PORT: Joi.number().required(),
				MARIADB_DB: Joi.string().required(),
				MARIADB_USER: Joi.string().required(),
				MARIADB_PASSWORD: Joi.string().required(),
				MARIADB_PORT: Joi.number().required(),
				MARIADB_HOST: Joi.string().required(),
				SECRET_TOKEN: Joi.string().required(),
			}),
		}),
		ConfigurationsModule,
		DatabasesModule,
		CouponsModule,
		CustomersModule,
		ImagesModule,
		InventoriesModule,
		InvoicesModule,
		ProductsModule,
		ReportsModule,
		ShippingsModule,
		ShopsModule,
		TreasuryModule,
		UsersModule,
	],
	providers: [AppGateway],
})
export class AppModule {}

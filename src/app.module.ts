/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';

import config from './config';
import { DatabasesModule } from './databases/databases.module';
import { enviroments } from './enviroments';
import { ImagesModule } from './images/images.module';
import { InventoriesModule } from './inventories/inventories.module';
import { ProductsModule } from './products/products.module';
import { ShopsModule } from './shops/shops.module';
import { TreasuryModule } from './treasury/treasury.module';
import { UsersModule } from './users/users.module';
import { AppGateway } from './app.gateway';
import { SalesModule } from './sales/sales.module';
import { CrmModule } from './crm/crm.module';
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
				MONGO_PASSWORD: Joi.string().required(),
				MONGO_USER: Joi.string().required(),
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
		DatabasesModule,
		ImagesModule,
		InventoriesModule,
		ProductsModule,
		ShopsModule,
		TreasuryModule,
		UsersModule,
		SalesModule,
		CrmModule,
	],
	providers: [AppGateway],
})
export class AppModule {}

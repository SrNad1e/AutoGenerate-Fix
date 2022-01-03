import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import { InvoicesModule } from './invoices/invoices.module';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { enviroments } from './enviroments';
import config from './config';
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: enviroments[process.env.NODE_ENV] || '.env',
			load: [config],
			isGlobal: true,
			validationSchema: Joi.object({
				//variables entornos que se desean desplegar name_variable: Joi.number.required()
			}),
		}),
		InvoicesModule,
		CouponsModule,
		CustomersModule,
		OrdersModule,
		ShopsModule,
		UsersModule,
		ProductsModule,
	],
})
export class AppModule {}

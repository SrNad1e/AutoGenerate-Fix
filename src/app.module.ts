import { Module } from '@nestjs/common';

import { InvoicesModule } from './invoices/invoices.module';
import { ConfigModule } from '@nestjs/config';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { enviroments } from './enviroments';
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: enviroments[process.env.NODE_ENV] || '.env',
			isGlobal: true,
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

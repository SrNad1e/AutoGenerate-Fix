import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { InvoicesModule } from './invoices/invoices.module';
import { CouponsModule } from './coupons/coupons.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ShopsModule } from './shops/shops.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

@Module({
	imports: [
		InvoicesModule,
		CouponsModule,
		CustomersModule,
		OrdersModule,
		ShopsModule,
		UsersModule,
		ProductsModule,
	],
	//	controllers: [AppController],
	//	providers: [AppService],
})
export class AppModule {}

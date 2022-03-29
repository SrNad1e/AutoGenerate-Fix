import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { Connection } from 'mongoose';
import { CrmModule } from 'src/crm/crm.module';

import { Order, OrderSchema } from './entities/order.entity';
import { OrdersService } from './services/orders.service';
import { ShopsModule } from 'src/shops/shops.module';
import { OrdersResolver } from './resolvers/orders.resolver';
import { ProductsModule } from 'src/products/products.module';
import { InventoriesModule } from 'src/inventories/inventories.module';
import { TreasuryModule } from 'src/treasury/treasury.module';
import { InvoicesService } from './services/invoices.service';
import { Invoice, InvoiceSchema } from './entities/invoice.entity';
import { PointOfSale, PointOfSaleSchema } from './entities/pointOfSale.entity';
import {
	AuthorizationDian,
	AuthorizationDianSchema,
} from './entities/authorization.entity';
import { PointOfSalesService } from './services/point-of-sales.service';

@Module({
	imports: [
		InventoriesModule,
		CrmModule,
		ShopsModule,
		ProductsModule,
		TreasuryModule,
		MongooseModule.forFeatureAsync([
			{
				name: Order.name,
				useFactory: async (connection: Connection) => {
					const schema = OrderSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'order_increment',
						inc_field: 'number',
						//	start_seq: 1888,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: Invoice.name,
				useFactory: async (connection: Connection) => {
					const schema = PointOfSaleSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'invoice_increment',
						inc_field: 'number',
						//	start_seq: 1888,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
		]),
		MongooseModule.forFeature([
			{
				name: PointOfSale.name,
				schema: PointOfSaleSchema,
			},
			{
				name: AuthorizationDian.name,
				schema: AuthorizationDianSchema,
			},
		]),
	],
	providers: [OrdersService, OrdersResolver, InvoicesService, PointOfSalesService],
	exports: [OrdersService],
})
export class SalesModule {}

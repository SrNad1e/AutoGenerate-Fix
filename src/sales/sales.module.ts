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
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import {
	ReturnInvoice,
	ReturnInvoiceSchema,
} from './entities/return-invoice.entity';
import { ReturnsInvoiceService } from './services/returns-invoice.service';
import { ReturnsInvoiceResolver } from './resolvers/returns-invoice.resolver';

@Module({
	imports: [
		InventoriesModule,
		CrmModule,
		ShopsModule,
		ProductsModule,
		TreasuryModule,
		ConfigurationsModule,
		MongooseModule.forFeatureAsync([
			{
				name: Order.name,
				useFactory: () => {
					const schema = OrderSchema;
					schema.index({ number: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: Invoice.name,
				useFactory: async () => {
					const schema = InvoiceSchema;
					schema.index({ number: 1, authorization: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: ReturnInvoice.name,
				useFactory: async () => {
					const schema = ReturnInvoiceSchema;
					schema.index({ number: 1, authorization: -1 }, { unique: true });
					return schema;
				},
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
	providers: [
		OrdersService,
		OrdersResolver,
		InvoicesService,
		PointOfSalesService,
		ReturnsInvoiceService,
		ReturnsInvoiceResolver,
	],
	exports: [OrdersService, PointOfSalesService],
})
export class SalesModule {}

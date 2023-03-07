import {
	CloseZInvoicingNumber,
	CloseZInvoicingNumberSchema,
} from './entities/close-z-invoicing-number.entity';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmModule } from 'src/crm/crm.module';

import { Order, OrderSchema } from './entities/order.entity';
import { OrdersService } from './services/orders.service';
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
import { ReturnOrder, ReturnOrderSchema } from './entities/return-order.entity';
import { ReturnsOrderService } from './services/returns-order.service';
import { ReturnsOrderResolver } from './resolvers/returns-order.resolver';
import { InvoicesResolver } from './resolvers/invoices.resolver';
import {
	CloseXInvoicing,
	CloseXInvoicingSchema,
} from './entities/close-x-invoicing.entity';
import { ClosesXInvoicingService } from './services/closes-xinvoicing.service';
import { ClosesXinvoicingResolver } from './resolvers/closes-xinvoicing.resolver';
import { PointOfSalesResolver } from './resolvers/point-of-sales.resolver';
import { ClosesZinvoicingService } from './services/closes-zinvoicing.service';
import {
	CloseZInvoicing,
	CloseZInvoicingSchema,
} from './entities/close-z-invoicing.entity';
import { ClosesZinvoicingResolver } from './resolvers/closes-zinvoicing.resolver';
import { CreditsModule } from 'src/credits/credits.module';
import { AuthorizationsService } from './services/authorizations.service';
import { AuthorizationsResolver } from './resolvers/authorizations.resolver';
import {
	StatusWebHistory,
	StatusWebHistorySchema,
} from './entities/status-web-history';
import { StatusWebHistoriesService } from './services/status-web-histories.service';
import { DailyClosingService } from './services/daily-closing.service';
import { DailyClosing, DailyClosingSchema } from './entities/dailyClosing';
import { DailyClosingResolver } from './resolvers/daily-closing.resolver';

@Module({
	imports: [
		forwardRef(() => InventoriesModule),
		CrmModule,
		forwardRef(() => ProductsModule),
		TreasuryModule,
		forwardRef(() => ConfigurationsModule),
		CreditsModule,
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
					schema.index(
						{ number: 1, 'authorization._id': -1 },
						{ unique: true },
					);
					return schema;
				},
			},
			{
				name: ReturnOrder.name,
				useFactory: async () => {
					const schema = ReturnOrderSchema;
					schema.index({ number: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: CloseXInvoicing.name,
				useFactory: async () => {
					const schema = CloseXInvoicingSchema;
					schema.index({ number: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: CloseZInvoicing.name,
				useFactory: async () => {
					const schema = CloseZInvoicingSchema;
					schema.index({ number: 1, company: 1, prefix: 1 }, { unique: true });
					return schema;
				},
			},
			{
				name: DailyClosing.name,
				useFactory: async () => {
					const schema = DailyClosingSchema;
					schema.index({ pointOfSale: 1, closeDate: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: CloseZInvoicingNumber.name,
				useFactory: async () => {
					const schema = CloseZInvoicingNumberSchema;
					schema.index({ company: 1, prefix: -1 }, { unique: true });
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
			{
				name: StatusWebHistory.name,
				schema: StatusWebHistorySchema,
			},
		]),
	],
	providers: [
		OrdersService,
		OrdersResolver,
		InvoicesService,
		InvoicesResolver,
		PointOfSalesService,
		PointOfSalesResolver,
		ReturnsOrderService,
		ReturnsOrderResolver,
		ClosesXInvoicingService,
		ClosesXinvoicingResolver,
		ClosesZinvoicingService,
		ClosesZinvoicingResolver,
		AuthorizationsService,
		AuthorizationsResolver,
		StatusWebHistoriesService,
		DailyClosingService,
		DailyClosingResolver,
	],
	exports: [OrdersService, PointOfSalesService],
})
export class SalesModule {}

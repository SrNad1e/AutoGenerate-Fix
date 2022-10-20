import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Payment, PaymentSchema } from './entities/payment.entity';
import { PaymentsService } from './services/payments.service';
import { PaymentsResolver } from './resolvers/payments.resolver';
import { Box, BoxSchema } from './entities/box.entity';
import { Expense, ExpenseSchema } from './entities/expense.entity';
import { Receipt, ReceiptSchema } from './entities/receipt.entity';
import { ReceiptsService } from './services/receipts.service';
import { BoxHistoryService } from './services/box-history.service';
import { BoxHistory, BoxHistorySchema } from './entities/box-history.entity';
import { BoxService } from './services/box.service';
import { ExpensesService } from './services/expenses.service';
import { ErrorsCashService } from './services/errors-cash.service';
import { ReceiptsResolver } from './resolvers/receipts.resolver';
import { ExpensesResolver } from './resolvers/expenses.resolver';
import { BoxesResolver } from './resolvers/boxes.resolver';
import { Order, OrderSchema } from 'src/sales/entities/order.entity';
import { CreditsModule } from 'src/credits/credits.module';
import {
	PointOfSale,
	PointOfSaleSchema,
} from 'src/sales/entities/pointOfSale.entity';
import { ErrorCash, ErrorCashSchema } from './entities/error-cash.entity';
import {
	CloseZInvoicing,
	CloseZInvoicingSchema,
} from 'src/sales/entities/close-z-invoicing.entity';
import { ErrorsCashResolver } from './resolvers/errors-cash.resolver';

@Module({
	imports: [
		CreditsModule,
		MongooseModule.forFeatureAsync([
			{
				name: Box.name,
				useFactory: async () => {
					const schema = BoxSchema;
					schema.index({ name: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: Expense.name,
				useFactory: async () => {
					const schema = ExpenseSchema;
					schema.index({ number: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: Receipt.name,
				useFactory: async () => {
					const schema = ReceiptSchema;
					schema.index({ number: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
		]),
		MongooseModule.forFeature([
			{
				name: Payment.name,
				schema: PaymentSchema,
			},
			{
				name: PointOfSale.name,
				schema: PointOfSaleSchema,
			},
			{
				name: BoxHistory.name,
				schema: BoxHistorySchema,
			},
			{
				name: Order.name,
				schema: OrderSchema,
			},
			{
				name: ErrorCash.name,
				schema: ErrorCashSchema,
			},
			{
				name: CloseZInvoicing.name,
				schema: CloseZInvoicingSchema,
			},
		]),
	],
	providers: [
		PaymentsService,
		PaymentsResolver,
		ReceiptsService,
		BoxHistoryService,
		ErrorsCashService,
		BoxService,
		ExpensesService,
		ReceiptsResolver,
		ExpensesResolver,
		BoxesResolver,
		ErrorsCashResolver,
	],
	exports: [
		PaymentsService,
		ErrorsCashService,
		ReceiptsService,
		ExpensesService,
		BoxService,
	],
})
export class TreasuryModule {}

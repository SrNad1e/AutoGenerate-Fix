import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Payment, PaymentSchema } from './entities/payment.entity';
import { PaymentsService } from './services/payments.service';
import { PaymentsResolver } from './resolvers/payments.resolver';
import { Box, BoxSchema } from './entities/box.entity';
import { Expense, ExpenseSchema } from './entities/expense.entity';
import { Receipt, ReceiptSchema } from './entities/receipt.entity';
import { ReceiptsService } from './services/receipts.service';

@Module({
	imports: [
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
		]),
	],
	providers: [PaymentsService, PaymentsResolver, ReceiptsService],
	exports: [PaymentsService, ReceiptsService],
})
export class TreasuryModule {}

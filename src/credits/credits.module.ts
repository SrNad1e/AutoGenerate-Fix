import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
	CreditHistory,
	CreditHistorySchema,
} from './entities/credit-history.entity';
import { Credit, CreditSchema } from './entities/credit.entity';
import { CreditsService } from './services/credits.service';
import { CreditHistoryService } from './services/credit-history.service';
import { Order, OrderSchema } from 'src/sales/entities/order.entity';
import { CreditsResolver } from './resolvers/credits.resolver';
import { CrmModule } from 'src/crm/crm.module';
import { CreditHistoryResolver } from './resolvers/credit-history.resolver';
import { Receipt, ReceiptSchema } from 'src/treasury/entities/receipt.entity';

@Module({
	imports: [
		CrmModule,
		MongooseModule.forFeature([
			{
				name: Credit.name,
				schema: CreditSchema,
			},
			{
				name: CreditHistory.name,
				schema: CreditHistorySchema,
			},
			{
				name: Order.name,
				schema: OrderSchema,
			},
			{
				name: Receipt.name,
				schema: ReceiptSchema,
			},
		]),
	],
	providers: [
		CreditsService,
		CreditHistoryService,
		CreditsResolver,
		CreditHistoryResolver,
	],
	exports: [CreditHistoryService, CreditsService],
})
export class CreditsModule {}

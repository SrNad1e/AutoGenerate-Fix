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
		]),
	],
	providers: [CreditsService, CreditHistoryService, CreditsResolver],
	exports: [CreditHistoryService, CreditsService],
})
export class CreditsModule {}

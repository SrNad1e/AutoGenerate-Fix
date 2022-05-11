import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Payment, PaymentSchema } from './entities/payment.entity';
import { PaymentsService } from './services/payments.service';
import { PaymentsResolver } from './resolvers/payments.resolver';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Payment.name,
				schema: PaymentSchema,
			},
		]),
	],
	providers: [PaymentsService, PaymentsResolver],
	exports: [PaymentsService],
})
export class TreasuryModule {}

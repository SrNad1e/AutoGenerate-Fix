import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RefundsController } from './controllers/refunds.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { RefundsService } from './services/refunds.service';
import { InvoicesService } from './services/invoices.service';
import { CouponsModule } from 'src/coupons/coupons.module';
import {
	ProductReturns,
	ProductReturnsSchema,
} from './entities/productreturns.entity';
@Module({
	imports: [
		CouponsModule,
		MongooseModule.forFeature([
			//TODO: modelo pendiente a cambiar por nombre más simple
			{
				name: ProductReturns.name,
				schema: ProductReturnsSchema,
			},
		]),
	],
	controllers: [RefundsController, InvoicesController],
	providers: [RefundsService, InvoicesService],
})
export class InvoicesModule {}

import { Module } from '@nestjs/common';
import { RefundsController } from './controllers/refunds.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { RefundsService } from './services/refunds.service';
import { InvoicesService } from './services/invoices.service';
import { CouponsModule } from 'src/coupons/coupons.module';
@Module({
	imports: [CouponsModule],
	controllers: [RefundsController, InvoicesController],
	providers: [RefundsService, InvoicesService],
})
export class InvoicesModule {}

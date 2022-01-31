import { Module } from '@nestjs/common';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { InvoicesModule } from 'src/invoices/invoices.module';
import { ReportsSalesService } from './services/reports-sales.service';
import { ReportSalesController } from './controllers/report-sales.controller';
import { ShopsModule } from 'src/shops/shops.module';

@Module({
	imports: [InvoicesModule, ConfigurationsModule, ShopsModule],
	providers: [ReportsSalesService],
	controllers: [ReportSalesController],
})
export class ReportsModule {}

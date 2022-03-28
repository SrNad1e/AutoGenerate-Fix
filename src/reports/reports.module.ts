/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { ReportsSalesService } from './services/reports-sales.service';
import { ReportSalesController } from './controllers/report-sales.controller';
import { ShopsModule } from 'src/shops/shops.module';
import { ReportsSalesResolver } from './resolvers/reports-sales.resolver';

@Module({
	imports: [ConfigurationsModule, ShopsModule],
	providers: [ReportsSalesService, ReportsSalesResolver],
	controllers: [ReportSalesController],
})
export class ReportsModule {}

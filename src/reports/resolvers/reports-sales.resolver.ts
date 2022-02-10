import { Args, Query, Resolver } from '@nestjs/graphql';
import { InvoicesService } from 'src/invoices/services/invoices.service';
import { ReportSalesResponse } from '../dtos/report-sales-response';
import { ReportsSalesService } from '../services/reports-sales.service';

@Resolver()
export class ReportsSalesResolver {
	constructor(
		private invoicesService: InvoicesService,
		private reportsSalesService: ReportsSalesService,
	) {}

	@Query(() => [ReportSalesResponse], { name: 'reportSales' })
	generateReportSales(
		@Args('year', { type: () => Number }) year: number,
	): Promise<ReportSalesResponse[]> {
		return this.reportsSalesService.generateReportSales(year);
	}
}

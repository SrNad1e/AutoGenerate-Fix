import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { ReportSalesResponse } from '../dtos/report-sales-response';
import { ReportsSalesService } from '../services/reports-sales.service';

@Resolver()
export class ReportsSalesResolver {
	constructor(private reportsSalesService: ReportsSalesService) {}

	@Query(() => [ReportSalesResponse], { name: 'reportSales' })
	@UseGuards(JwtAuthGuard)
	generateReportSales(
		@Args('year', { type: () => Number }) year: number,
	): Promise<ReportSalesResponse[]> {
		return this.reportsSalesService.generateReportSales(year);
	}
}

import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsSalesService } from '../services/reports-sales.service';

@Controller('report-sales')
export class ReportSalesController {
	constructor(private reportsSalesService: ReportsSalesService) {}

	@Get('bonusForGoal')
	bonusForGoal(@Query('shopId', ParseIntPipe) shopId: number) {
		return this.reportsSalesService.bonusForGoal(shopId);
	}
}

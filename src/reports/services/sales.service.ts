import { Injectable } from '@nestjs/common';
import { FiltersSalesReportInput } from 'src/sales/dtos/filters-sales-report.input';
import { OrdersService } from 'src/sales/services/orders.service';
import { ResponseReportSales } from '../dtos/response-report-sales';

@Injectable()
export class SalesService {
	constructor(private readonly ordersService: OrdersService) {}

	async reportSales(
		filtersSalesReportInput: FiltersSalesReportInput,
		companyId: string,
	): Promise<ResponseReportSales> {
		return this.ordersService.reportSales(filtersSalesReportInput, companyId);
	}
}

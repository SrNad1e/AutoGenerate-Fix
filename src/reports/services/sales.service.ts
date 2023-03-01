import { Injectable } from '@nestjs/common';
import { FiltersSalesReportInput } from 'src/sales/dtos/filters-sales-report.input';
import { OrdersService } from 'src/sales/services/orders.service';
import { FiltersSalesReportInvoicingInput } from '../dtos/filters-sales-report-invoicing.input';
import { ResponseReportSales } from '../dtos/response-report-sales';
import { ResponseReportSalesInvoicing } from '../dtos/response-report-sales-invoicing';

@Injectable()
export class SalesService {
	constructor(private readonly ordersService: OrdersService) {}

	async reportSalesInvoicing(
		filtersSalesReportInput: FiltersSalesReportInvoicingInput,
		companyId: string,
	): Promise<ResponseReportSalesInvoicing> {
		return this.ordersService.reportSalesInvoicing(
			filtersSalesReportInput,
			companyId,
		);
	}

	async reportSales(
		filtersSalesReportInput: FiltersSalesReportInput,
		companyId: string,
	): Promise<ResponseReportSales> {
		return this.ordersService.reportSales(filtersSalesReportInput, companyId);
	}
}

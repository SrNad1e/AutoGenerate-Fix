import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersSalesReportInput } from 'src/sales/dtos/filters-sales-report.input';
import { ResponseReportSales } from '../dtos/response-report-sales';
import { SalesService } from '../services/sales.service';

@Resolver()
export class SalesResolver {
	constructor(private readonly salesService: SalesService) {}

	@Query(() => ResponseReportSales, {
		name: 'reportSales',
		description: 'Consulta las ventas por rango de fechas',
	})
	@RequirePermissions(Permissions.REPORT_INVOICING_SALES)
	getGoalStatus(
		@Args({
			name: 'filtersSalesReportInput',
			description: 'Filtros para obtener las ventas',
		})
		_: FiltersSalesReportInput,
		@Context() context,
	) {
		return this.salesService.reportSales(
			context.req.body.variables.input,
			context.req.user.companyId,
		);
	}
}

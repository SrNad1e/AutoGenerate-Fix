import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/users/libs/permissions.decorator';
import { FiltersInvoicesInput } from '../dtos/filters-invoices.input';
import { ResponseInvoices } from '../dtos/response-invoices';
import { InvoicesService } from '../services/invoices.service';

@Resolver()
export class InvoicesResolver {
	constructor(private readonly invoicesService: InvoicesService) {}

	@Query(() => ResponseInvoices, {
		name: 'invoices',
		description: 'Lista de facturas',
	})
	@RequirePermissions(Permissions.READ_INVOICING_INVOICES)
	findAll(
		@Args({
			name: 'filtersInvoices',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de facturas',
		})
		_: FiltersInvoicesInput,
		@Context() context,
	) {
		return this.invoicesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
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
	@UseGuards(JwtAuthGuard)
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

import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersReturnsInvoiceInput } from '../dtos/filters-returns-invoice';
import { ResponseReturnsInvoice } from '../dtos/response-returnsInvoice';
import { ReturnsInvoiceService } from '../services/returns-invoice.service';

@Resolver()
export class ReturnsInvoiceResolver {
	constructor(private readonly returnsInvoiceService: ReturnsInvoiceService) {}

	@Query(() => ResponseReturnsInvoice, {
		name: 'returnsInvoice',
		description: 'Lista de devoluciones de factura',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersReturnsInvoice',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de devoluciones de factura',
		})
		_: FiltersReturnsInvoiceInput,
		@Context() context,
	) {
		return this.returnsInvoiceService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

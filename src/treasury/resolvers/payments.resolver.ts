import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersPaymentsInput } from '../dtos/filters-payments.input';

import { ResponsePayments } from '../dtos/response-payments';
import { PaymentsService } from '../services/payments.service';

@Resolver()
export class PaymentsResolver {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Query(() => ResponsePayments, {
		name: 'payments',
		description: 'Se encarga de listar los metodos de pago',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersPaymentsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar los metodos de pagos',
		})
		_: FiltersPaymentsInput,
		@Context() context,
	) {
		return this.paymentsService.findAll(context.req.body.variables.input);
	}
}

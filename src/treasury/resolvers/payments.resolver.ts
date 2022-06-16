import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
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
	@RequirePermissions(Permissions.READ_TREASURY_PAYMENTS)
	findAll(
		@Args({
			name: 'filtersPaymentsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar los métodos de pagos',
		})
		_: FiltersPaymentsInput,
		@Context() context,
	) {
		return this.paymentsService.findAll(context.req.body.variables.input);
	}
}

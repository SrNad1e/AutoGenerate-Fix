import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreatePaymentInput } from '../dtos/create-payment.input';
import { FiltersPaymentsInput } from '../dtos/filters-payments.input';
import { ResponsePayments } from '../dtos/response-payments';
import { UpdatePaymentInput } from '../dtos/update-payment.input';
import { Payment } from '../entities/payment.entity';
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

	@Mutation(() => Payment, {
		name: 'createPayment',
		description: 'Crea un método de pago',
	})
	@RequirePermissions(Permissions.CREATE_TREASURY_PAYMENT)
	create(
		@Args('createPaymentInput', {
			description: 'Datos para la creación del método de pago',
		})
		_: CreatePaymentInput,
		@Context() context,
	) {
		return this.paymentsService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => Payment, {
		name: 'updatePayment',
		description: 'Actualiza un método de pago',
	})
	@RequirePermissions(Permissions.UPDATE_TREASURY_PAYMENT)
	update(
		@Args('id', {
			description: 'Identificador del método de pago para actualizar',
		})
		id: string,
		@Args('updatePaymentInput', {
			description: 'Datos para actualizar el método de pago',
		})
		_: UpdatePaymentInput,
		@Context() context,
	) {
		return this.paymentsService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}

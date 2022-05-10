import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersCustomersInput } from '../dtos/filters-customers.input';
import { ResponseCustomers } from '../dtos/response-customers';
import { UpdateCustomerInput } from '../dtos/update-customer.input';
import { Customer } from '../entities/customer.entity';
import { CustomersService } from '../services/customers.service';

@Resolver()
export class CustomersResolver {
	constructor(private readonly customersService: CustomersService) {}

	@Query(() => ResponseCustomers, {
		name: 'customers',
		description: 'Listado de clientes',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersCustomerInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar el listado de clientes',
		})
		_: FiltersCustomersInput,
		@Context() context,
	) {
		return this.customersService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Customer, {
		name: 'updateCustomer',
		description: 'Se encarga actualizar un cliente',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador del cliente' }) id: string,
		@Args('updateCustomerInput', {
			description: 'Parámetros para actualizar el cliente',
		})
		_: UpdateCustomerInput,
		@Context() context,
	) {
		return this.customersService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

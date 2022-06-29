import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCustomerInput } from '../dtos/create-customer.input';
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
	@RequirePermissions(Permissions.READ_CRM_CUSTOMERS)
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
		name: 'createCustomer',
		description: 'Se encarga crear un cliente',
	})
	@RequirePermissions(Permissions.CREATE_CRM_CUSTOMER)
	create(
		@Args('createCustomerInput', {
			description: 'Parámetros para actualizar el cliente',
		})
		_: CreateCustomerInput,
		@Context() context,
	) {
		return this.customersService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Customer, {
		name: 'updateCustomer',
		description: 'Se encarga actualizar un cliente',
	})
	@RequirePermissions(Permissions.UPDATE_CRM_CUSTOMER)
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

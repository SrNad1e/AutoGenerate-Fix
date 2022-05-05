import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersCustomersInput } from '../dtos/filters-customers.input';
import { ResponseCustomers } from '../dtos/response-customers';
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
}

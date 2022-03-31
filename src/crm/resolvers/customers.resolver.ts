import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersCustomerInput } from '../dtos/filters-customer-input';
import { ResponseCustomer } from '../dtos/response-customer';
import { CustomersService } from '../services/customers.service';

@Resolver()
export class CustomersResolver {
	constructor(private readonly customersService: CustomersService) {}

	@Query(() => ResponseCustomer, { name: 'customers' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersCustomerInput',
			nullable: true,
			defaultValue: {},
		})
		_: FiltersCustomerInput,
		@Context() context,
	) {
		return this.customersService.findAll(context.req.body.variables.input);
	}
}

import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersCustomerInput } from '../dtos/filters-customer-input';
import { Customer } from '../entities/customer.entity';
import { ResponseCustomer } from '../entities/response-customer';
import { CustomersService } from '../services/customers.service';

@Resolver()
export class CustomersResolver {
	constructor(
		@InjectModel(Customer.name)
		private readonly customersService: CustomersService,
	) {}

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

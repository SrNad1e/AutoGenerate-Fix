import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersCustomerTypesInput } from '../dtos/filters-customer-types.input';
import { ResponseCustomerTypes } from '../dtos/response-customerTypes';
import { CustomerTypeService } from '../services/customer-type.service';

@Resolver()
export class CustomerTypesResolver {
	constructor(private readonly customerTypesService: CustomerTypeService) {}

	@Query(() => ResponseCustomerTypes, {
		name: 'customerTypes',
		description: 'Listado de tipos de cliente',
	})
	@RequirePermissions(Permissions.READ_CRM_CUSTOMERTYPES)
	findAll(
		@Args({
			name: 'filtersCustomerTypesInput',
			description: 'Filtros para consultar el listado de tipos de cliente',
		})
		_: FiltersCustomerTypesInput,
		@Context() context,
	) {
		return this.customerTypesService.findAll(context.req.body.variables.input);
	}
}

import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersPointOfSalesInput } from '../dtos/filters-point-of-sales.input';
import { ResponsePointOfSales } from '../dtos/response-point-of-sales';
import { PointOfSalesService } from '../services/point-of-sales.service';

@Resolver()
export class PointOfSalesResolver {
	constructor(private readonly pointOfSalesService: PointOfSalesService) {}

	@Query(() => ResponsePointOfSales, {
		name: 'pointOfSales',
		description: 'Lista de puntos de venta',
	})
	@RequirePermissions(Permissions.READ_INVOICING_POINTOFSALES)
	findAll(
		@Args({
			name: 'filtersPointOfSales',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de puntos de venta',
		})
		_: FiltersPointOfSalesInput,
		@Context() context,
	) {
		return this.pointOfSalesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

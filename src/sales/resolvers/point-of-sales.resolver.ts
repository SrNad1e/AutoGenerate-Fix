import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

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
	@UseGuards(JwtAuthGuard)
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

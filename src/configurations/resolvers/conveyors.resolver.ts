import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersConveyorsInput } from '../dtos/filters-conveyors.input';

import { ResponseConveyors } from '../dtos/response-conveyors.input';
import { ConveyorsService } from '../services/conveyors.service';

@Resolver()
export class ConveyorsResolver {
	constructor(private readonly conveyorsService: ConveyorsService) {}

	@Query(() => ResponseConveyors, {
		name: 'conveyors',
		description: 'Lista de ajustes de productos',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersConveyorsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de las trasnportadoras',
		})
		_: FiltersConveyorsInput,
		@Context() context,
	) {
		return this.conveyorsService.findAll(context.req.body.variables.input);
	}
}

import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
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
	@RequirePermissions(Permissions.READ_CONFIGURATION_CONVEYORS)
	findAll(
		@Args({
			name: 'filtersConveyorsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de las transportadoras',
		})
		_: FiltersConveyorsInput,
		@Context() context,
	) {
		return this.conveyorsService.findAll(context.req.body.variables.input);
	}
}

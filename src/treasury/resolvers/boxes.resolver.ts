import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersBoxesInput } from '../dtos/filters-boxes.input';
import { ResponseBoxes } from '../dtos/response-boxes.input';
import { BoxService } from '../services/box.service';

@Resolver()
export class BoxesResolver {
	constructor(private readonly boxService: BoxService) {}

	@Query(() => ResponseBoxes, {
		name: 'boxes',
		description: 'Se encarga de listar las cajas',
	})
	@RequirePermissions(Permissions.READ_TREASURY_BOXES)
	findAll(
		@Args({
			name: 'filtersBoxesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las cajas',
		})
		_: FiltersBoxesInput,
		@Context() context,
	) {
		return this.boxService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

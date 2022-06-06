import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersShopsInput } from '../dtos/filters-shops.input';
import { ResponseShops } from '../dtos/response-shops';
import { ShopsService } from '../services/shops.service';

@Resolver()
export class ShopsResolver {
	constructor(private readonly shopsService: ShopsService) {}

	@Query(() => ResponseShops, {
		name: 'shops',
		description: 'Se encarga de listar las tiendas',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_SHOPS)
	findAll(
		@Args({
			name: 'filtersShopsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las tiendas',
		})
		_: FiltersShopsInput,
		@Context() context,
	) {
		return this.shopsService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

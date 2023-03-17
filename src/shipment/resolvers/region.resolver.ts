import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRegionInput } from '../dtos/create-region-input';
import { Region } from '../entities/region.entity';

import {
	Permissions,
	RequirePermissions,
} from '../../configurations/libs/permissions.decorator';

import { regionService } from '../services/region.service';

@Resolver()
export class RegionResolver {
	constructor(private readonly regionService: regionService) {}

	@Mutation(() => Region, {
		name: 'createRegion',
		description: 'Crea una region',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	create(
		@Args('createRegionInput', {
			description: 'Datos para la creación del rol',
		})
		_: CreateRegionInput,
		@Context() context,
	) {

        console.log(context.req.body.variables)
		return this.regionService.create(
			context.req.body.variables.CreateRegionInput,
			context.req.user.user,
		);
	}
}

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRegionInput } from '../dtos/create-region-input';
import { Region } from '../entities/region.entity';
import {
	Permissions,
	RequirePermissions,
} from '../../configurations/libs/permissions.decorator';
import { regionService } from '../services/region.service';
import { ResponseRegion } from '../dtos/response-region';
import { FiltersRegionInput } from '../dtos/filter-region-input';
import { UpdateRegionInput } from '../dtos/update-regions.input';


@Resolver()
export class RegionResolver {
	constructor(private readonly regionService: regionService) {}

	@Query(() => ResponseRegion, {
		name: 'regions',
		description: 'Listado de las regiones',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	findAlls(
		@Args({
			name: 'filtersRegionInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para las zonas',
		})
		_: FiltersRegionInput,
		@Context() context,
	) {

console.log(context.req.body.variables)
		return this.regionService.findAll(
			context.req.body.variables.filter,
			context.req.user.user,
		);
	}

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

		return this.regionService.create(
			context.req.body.variables.CreateRegionInput,
			context.req.user.user,
		);
	}

	@Mutation(() => Region, {
		name: 'updateRegion',
		description: 'Actualiza una region',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	update(
		@Args('id', {
			description: 'Identificador del rol para actualizar',
		})
		id: string,
		@Args('updateRegionInput', {
			description: 'Datos para actualizar el rol',
		})
		_: UpdateRegionInput,
		@Context() context,
	) {



		return this.regionService.update(
			id,
			context.req.body.variables.data,
			context.req.user.user,
		);
	}


}

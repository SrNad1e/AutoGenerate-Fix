import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateZoneInput } from '../dtos/create-zone.input';
import { Zone } from '../entities/zone.entity';
import {
	Permissions,
	RequirePermissions,
} from '../../configurations/libs/permissions.decorator';

import { ResponseZone } from '../dtos/response-roles';
import { UpdateZoneInput } from '../dtos/update-zone.input';
import { ZoneService } from '../services/zone.service';
import { FiltersZoneInput } from '../dtos/filter-zone-input';

@Resolver()
export class ZoneResolver {
	constructor(private readonly zoneService: ZoneService) {}

	@Query(() => ResponseZone, {
		name: 'zona',
		description: 'Listado de las zonas',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	findAlls(
		@Args({
			name: 'filtersZoneInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para las zonas',
		})
		_: FiltersZoneInput,
		@Context() context,
	) {
		return this.zoneService.findAll(
			context.req.body.variables.filtersZoneInput,
			context.req.user.user,
		);
	}

	@Mutation(() => Zone, {
		name: 'createZone',
		description: 'Crea una zona',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	create(
		@Args('createZoneInput', {
			description: 'Datos para la creación del rol',
		})
		_: CreateZoneInput,
		@Context() context,
	) {
		return this.zoneService.create(
			context.req.body.variables.CreateZoneInput,
			context.req.user.user,
		);
	}

	@Mutation(() => Zone, {
		name: 'updateZone',
		description: 'Actualiza un rol',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_ROLE)
	update(
		@Args('id', {
			description: 'Identificador del rol para actualizar',
		})
		id: string,
		@Args('updateZoneInput', {
			description: 'Datos para actualizar el rol',
		})
		_: UpdateZoneInput,
		@Context() context,
	) {



		return this.zoneService.update(
			id,
			context.req.body.variables.updateZoneInput,
			context.req.user.user,
		);
	}
}

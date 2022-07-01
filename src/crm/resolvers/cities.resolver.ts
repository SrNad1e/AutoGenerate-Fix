import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCityInput } from '../dtos/create-city.input';
import { FiltersCitiesInput } from '../dtos/filters-cities-input';
import { ResponseCities } from '../dtos/response-cities';
import { UpadteCityInput } from '../dtos/update-city.input';
import { City } from '../entities/city.entity';
import { CitiesService } from '../services/cities.service';

@Resolver()
export class CitiesResolver {
	constructor(private readonly citiesService: CitiesService) {}

	@Query(() => ResponseCities, {
		name: 'cities',
		description: 'Listado de ciudades',
	})
	@RequirePermissions(Permissions.READ_CRM_CITIES)
	findAll(
		@Args({
			name: 'filtersCitiesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar el listado de clientes',
		})
		_: FiltersCitiesInput,
		@Context() context,
	) {
		return this.citiesService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => City, {
		name: 'createCity',
		description: 'Crea una ciudad',
	})
	@RequirePermissions(Permissions.CREATE_CRM_CITY)
	create(
		@Args('createCityInput', {
			description: 'Datos para la creación de la ciudad',
		})
		_: CreateCityInput,
		@Context() context,
	) {
		return this.citiesService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => City, {
		name: 'updateCity',
		description: 'Actualiza una ciudad',
	})
	@RequirePermissions(Permissions.UPDATE_CRM_CITY)
	update(
		@Args('id', {
			description: 'Identificador de la ciudad para actualizar',
		})
		id: string,
		@Args('updateCityInput', {
			description: 'Datos para actualizar la ciudad',
		})
		_: UpadteCityInput,
		@Context() context,
	) {
		return this.citiesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}

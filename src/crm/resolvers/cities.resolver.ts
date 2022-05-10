import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersCitiesInput } from '../dtos/filters-cities-input';
import { ResponseCities } from '../dtos/response-cities';
import { CitiesService } from '../services/cities.service';

@Resolver()
export class CitiesResolver {
	constructor(private readonly citiesService: CitiesService) {}

	@Query(() => ResponseCities, {
		name: 'cities',
		description: 'Listado de ciudades',
	})
	@UseGuards(JwtAuthGuard)
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
}

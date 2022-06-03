import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ResponseColors } from '../dtos/response-colors';
import { FiltersColorsInput } from '../dtos/filters-colors.input';
import { Color } from '../entities/color.entity';
import { ColorsService } from '../services/colors.service';
import { UpdateColorInput } from '../dtos/update-color.input';
import { CreateColorInput } from '../dtos/create-color.input';
import {
	Permissions,
	RequirePermissions,
} from 'src/users/libs/permissions.decorator';

@Resolver(() => Color)
export class ColorsResolver {
	constructor(private readonly colorsService: ColorsService) {}

	@Query(() => ResponseColors, {
		name: 'colors',
		description: 'Lista los colores',
	})
	findAll(
		@Args({
			name: 'filtersColorsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para obtener los colores',
		})
		_: FiltersColorsInput,
		@Context() context,
	) {
		return this.colorsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Color, { name: 'createColor', description: 'Crea un color' })
	@RequirePermissions(Permissions.CREATE_INVENTORY_COLOR)
	create(
		@Args('createColorInput', { description: 'Datos para crear el color' })
		_: CreateColorInput,
		@Context() context,
	) {
		return this.colorsService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => Color, {
		name: 'updateColor',
		description: 'Actualiza el color',
	})
	@RequirePermissions(Permissions.UPDATE_INVENTORY_COLOR)
	update(
		@Args('id', { description: 'Identificador del color a actualizar' })
		id: string,
		@Args('updateColorInput', { description: 'Datos para actualizar un color' })
		_: UpdateColorInput,
		@Context() context,
	) {
		return this.colorsService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}

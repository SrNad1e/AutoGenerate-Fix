import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { ResponseColor } from '../dtos/response-color';
import { FiltersColorInput } from '../dtos/filters-colors.input';
import { Color } from '../entities/color.entity';
import { ColorsService } from '../services/colors.service';
import { UpdateColorInput } from '../dtos/update-color.input';
import { CreateColorInput } from '../dtos/create-color.input';

@Resolver(() => Color)
export class ColorsResolver {
	constructor(private readonly colorsService: ColorsService) {}

	@Query(() => ResponseColor, {
		name: 'colors',
		description: 'Lista los colores',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersColorInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para obtener los colores',
		})
		_: FiltersColorInput,
		@Context() context,
	) {
		return this.colorsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Color, { name: 'createColor', description: 'Crea un color' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createColorInput', { description: 'Datos para crear el color' })
		_: CreateColorInput,
		@Context() context,
	) {
		return this.colorsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Color, {
		name: 'updateColor',
		description: 'Actualiza el color',
	})
	@UseGuards(JwtAuthGuard)
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
			context.req.user,
		);
	}
}

import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersCategoriesInput } from '../dtos/filters-categories.input';
import { ResponseCategories } from '../dtos/response-categories';
import { CategoriesService } from '../services/categories.service';

@Resolver()
export class CategoriesResolver {
	constructor(private readonly categoriesService: CategoriesService) {}

	@Query(() => ResponseCategories, {
		name: 'categories',
		description: 'Lista las categorías',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersCategoriesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para obtener las categorías',
		})
		_: FiltersCategoriesInput,
		@Context() context,
	) {
		return this.categoriesService.findAll(context.req.body.variables.input);
	}
	/*
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
	}*/
}

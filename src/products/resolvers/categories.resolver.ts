import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateCategoryInput } from '../dtos/create-category.input';
import { FiltersCategoriesInput } from '../dtos/filters-categories.input';
import { ResponseCategories } from '../dtos/response-categories';
import { UpdateCategoryInput } from '../dtos/update-category.input';
import { CategoryLevel1 } from '../entities/category-level1.entity';
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
	@Mutation(() => CategoryLevel1, {
		name: 'createCategory',
		description: 'Crea una categoría',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createCategoryInput', {
			description: 'Datos para crear una categoría',
		})
		_: CreateCategoryInput,
		@Context() context,
	) {
		return this.categoriesService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => CategoryLevel1, {
		name: 'updateCategory',
		description: 'Actualiza la categoría',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador de la categoría a actualizar' })
		id: string,
		@Args('updateCategoryInput', {
			description: 'Datos para actualizar una categoría',
		})
		_: UpdateCategoryInput,
		@Context() context,
	) {
		return this.categoriesService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

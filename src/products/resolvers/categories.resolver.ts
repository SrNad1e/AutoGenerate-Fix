import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	InventoryPermissions,
	RequirePermissions,
} from 'src/users/libs/permissions.decorator';
import { CreateCategoryInput } from '../dtos/create-category.input';
import { FiltersCategoriesLevelInput } from '../dtos/filters-categories-level.input';
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

	@Query(() => ResponseCategories, {
		name: 'categoriesLevel',
		description: 'Lista las categorías por level',
	})
	@RequirePermissions(InventoryPermissions.READ_INVENTORY_CATEGORIES)
	findAllLevel(
		@Args({
			name: 'filtersCategoriesLevelInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para obtener las categorías',
		})
		_: FiltersCategoriesLevelInput,
		@Context() context,
	) {
		return this.categoriesService.findAllLevel(
			context.req.body.variables.input,
		);
	}

	@Mutation(() => CategoryLevel1, {
		name: 'createCategory',
		description: 'Crea una categoría',
	})
	@RequirePermissions(InventoryPermissions.CREATE_INVENTORY_CATEGORY)
	create(
		@Args('createCategoryInput', {
			description: 'Datos para crear una categoría',
		})
		_: CreateCategoryInput,
		@Context() context,
	) {
		return this.categoriesService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => CategoryLevel1, {
		name: 'updateCategory',
		description: 'Actualiza la categoría',
	})
	@RequirePermissions(InventoryPermissions.UPDATE_INVENTORY_CATEGORY)
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
			context.req.user.user,
		);
	}
}

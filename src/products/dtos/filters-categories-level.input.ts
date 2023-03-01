import { Field, InputType } from '@nestjs/graphql';

import { SortCategories } from './filters-categories.input';

@InputType({ description: 'Filtros para obtener la lista de categorías' })
export class FiltersCategoriesLevelInput {
	@Field(() => String, {
		description: 'Nombre de la categoría',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Identificador de la categoría',
		nullable: true,
	})
	_id?: string;

	@Field(() => String, {
		description: 'Identificador de la categoría padre',
		nullable: true,
	})
	parentId?: string;

	@Field({ description: 'Nivel de categoria' })
	level: number;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortCategories, { description: 'Ordenamiento', nullable: true })
	sort?: SortCategories;

	@Field(() => String, { description: 'Compañía', nullable: true })
	companyId?: string;
}

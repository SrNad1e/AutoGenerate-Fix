import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de categorías' })
export class SortCategories {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros para obtener la lista de categorías' })
export class FiltersCategoriesInput {
	@Field(() => String, {
		description: 'Nombre de la categoría de primer nivel',
		nullable: true,
	})
	name?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortCategories, { description: 'Ordenamiento', nullable: true })
	sort?: SortCategories;
}

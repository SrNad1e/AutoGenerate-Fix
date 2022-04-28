import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para obtener la lista de categorías' })
export class FiltersCategoriesInput {
	@Field(() => String, {
		description: 'Nombre de la referencia',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Descripcion de la referencia',
		nullable: true,
	})
	description?: string;
}

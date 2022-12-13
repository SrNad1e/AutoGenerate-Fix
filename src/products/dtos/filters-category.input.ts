import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para obtener una sola categoría' })
export class FiltersCategoryInput {
	@Field(() => String, { description: 'Nombre de la categoría' })
	name: string;
}

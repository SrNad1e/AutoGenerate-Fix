import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar la categoría' })
export class UpdateCategoryInput {
	@Field(() => Number, { description: 'Nivel de la categoría' })
	level: number;

	@Field(() => String, {
		description: 'Nombre de la categoría',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Identificador de la categoría padre ',
		nullable: true,
	})
	parentId?: string;
}

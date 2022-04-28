import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de una categoría' })
export class CreateCategoryInput {
	@Field(() => String, { description: 'Nombre de la categoría' })
	name: string;

	@Field(() => Number, {
		description: 'Nivel de la categoría',
		nullable: true,
	})
	level: number;

	@Field(() => String, {
		description: 'Identificador de la categoría padre',
		nullable: true,
	})
	parentCategoryId?: string;
}

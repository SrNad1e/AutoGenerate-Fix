import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de una categoría' })
export class CreateCategoryInput {
	@Field(() => String, { description: 'Nombre de la categoría' })
	name: string;

	@Field(() => String, {
		description: 'Identificador de la categoría nivel 1',
		nullable: true,
	})
	categoryLevel1Id?: string;

	@Field(() => String, {
		description: 'Identificador de la categoría nivel 2',
		nullable: true,
	})
	categoryLevel2Id?: string;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para los tipos de documento' })
export class FiltersDocumentTypesInput {
	@Field(() => String, {
		description: 'Nombre del tipo de documento',
		nullable: true,
	})
	name?: string;

	@Field(() => Boolean, {
		description: 'Estado activo del documento',
		nullable: true,
	})
	active?: boolean;
}

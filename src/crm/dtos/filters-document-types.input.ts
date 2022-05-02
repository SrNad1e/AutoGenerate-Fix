import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para los tipos de documento' })
export class FiltersDocumentTypesInput {
	@Field(() => String, { description: 'Nombre del tipo de documento' })
	name: string;
}

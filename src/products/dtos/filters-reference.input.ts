import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para obtener una referencia' })
export class FiltersReferenceInput {
	@Field(() => String, {
		description: 'Identificador de mongo',
		nullable: true,
	})
	_id?: string;

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

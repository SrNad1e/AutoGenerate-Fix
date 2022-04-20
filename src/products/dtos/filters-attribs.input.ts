import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de atributos' })
export class SortAttrib {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	active?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros para la lista de atributos' })
export class FiltersAttribsInput {
	@Field(() => String, { description: 'Nombre del atributo', nullable: true })
	name?: string;

	@Field({ description: 'Estado del atributo', nullable: true })
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortAttrib, { description: 'Ordenamiento', nullable: true })
	sort?: SortAttrib;
}

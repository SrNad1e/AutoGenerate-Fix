import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersColorInput {
	@Field({ description: 'Comodín busqueda del color', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	skip?: number;
}

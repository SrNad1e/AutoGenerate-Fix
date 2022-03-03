import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersSizeInput {
	@Field({ description: 'Comodín busqueda de la talla', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;
}

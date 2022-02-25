import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersWarehouseInput {
	@Field({ description: 'Comodín busqueda de la bodega', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;
}

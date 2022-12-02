import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creacion de una bodega' })
export class CreateWarehouseInput {
	@Field(() => String, { description: 'Nombre de la bodega' })
	name: string;

	@Field(() => Number, { description: 'Inventario máximo de productos' })
	max: number;

	@Field(() => Number, { description: 'Inventario mínimo de productos' })
	min: number;
}

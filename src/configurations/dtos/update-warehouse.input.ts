import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateWarehouseInput } from './create-warehouse.input';

@InputType({ description: 'Datos para actualizar ' })
export class UpdateWarehouseInput extends PartialType(CreateWarehouseInput) {
	@Field(() => Boolean, { description: 'Estado de la bodega', nullable: true })
	active?: boolean;
}

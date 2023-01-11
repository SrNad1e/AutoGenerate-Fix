import { Field, InputType } from '@nestjs/graphql';

import { StatusOrder } from '../entities/order.entity';

@InputType({ description: 'Datos para crear el pedido' })
export class CreateOrderInput {
	@Field(() => StatusOrder, {
		description: 'Estado del pedido',
	})
	status: StatusOrder;

	@Field(() => String, {
		description: 'Identificador de la tienda del pedido',
	})
	shopId?: string;
}

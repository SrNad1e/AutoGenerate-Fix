import { Field, ObjectType } from '@nestjs/graphql';
import { Credit } from 'src/credits/entities/credit.entity';
import { Order } from '../entities/order.entity';

@ObjectType({ description: 'Respuesta para obtener la orden' })
export class ResponseOrder {
	@Field(() => Order, { description: 'Pedido actualizado' })
	order: Order;

	@Field(() => Credit, {
		description: 'Crédito que tiene el cliente',
		nullable: true,
	})
	credit?: Credit;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear el pedido' })
export class CreateOrderInput {
	@Field(() => String, {
		description:
			'Estado del pedido (open, pending ,cancelled, closed, sent, invoiced)',
	})
	status: string;
}

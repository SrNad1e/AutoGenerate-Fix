import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput {
	@Field(() => String, {
		description:
			'Estado del pedido (open, pending ,cancelled, closed, sent, invoiced)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Identificación del cliente',
		nullable: true,
	})
	customerId: string;
}

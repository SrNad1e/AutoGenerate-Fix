import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput {
	@Field(() => String, {
		description:
			'Estado del pedido (open, pending ,cancelled, closed, sent, invoiced)',
	})
	status: string;
}

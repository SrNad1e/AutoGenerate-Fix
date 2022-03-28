import { Field, InputType } from '@nestjs/graphql';
import { Product } from 'src/products/entities/product.entity';
import { Payment } from 'src/treasury/entities/payment.entity';

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

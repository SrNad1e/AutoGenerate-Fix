import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddPaymentsOrderInput {
	@Field(() => String, {
		description: 'Id del pedido que se requiere agreagar o editar productos',
	})
	orderId: string;

	@Field(() => [PaymentsOrderInput], {
		description: 'Medios de pago',
	})
	payments: PaymentsOrderInput[];
}

@InputType()
export class PaymentsOrderInput {
	@Field(() => String, {
		description: 'Identificador medio de pago agregado al pedido',
	})
	paymentId: string;

	@Field(() => Number, { description: 'Valor total agregado' })
	total: number;

	@Field(() => String, {
		description:
			'Acción a realizar con el medio de pago (create, update, delete)',
	})
	action: string;
}

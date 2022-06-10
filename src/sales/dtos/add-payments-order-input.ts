import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum ActionPaymentsOrder {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

registerEnumType(ActionPaymentsOrder, { name: 'ActionPaymentsOrder' });

@InputType({ description: 'Medio de pago que se va a agregar' })
export class PaymentsOrderInput {
	@Field(() => String, {
		description: 'Identificador medio de pago agregado al pedido',
	})
	paymentId: string;

	@Field(() => Number, { description: 'Valor total agregado' })
	total: number;

	@Field(() => ActionPaymentsOrder, {
		description: 'Acción a realizar con el medio de pago',
	})
	action: ActionPaymentsOrder;
}

@InputType({ description: 'Datos para agregar medios de pago al pedido' })
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

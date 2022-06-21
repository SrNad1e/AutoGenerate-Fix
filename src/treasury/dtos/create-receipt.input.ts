import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Detalles de cruce de la cartera' })
export class DetailReceiptOrder {
	@Field(() => String, { description: 'Identificador del pedido' })
	orderId: string;

	@Field(() => Number, { description: 'Monto para abonar al pedido' })
	amount: number;
}

@InputType({ description: 'Datos para crear un recibo de caja' })
export class CreateReceiptInput {
	@Field(() => String, {
		description: 'Identificador de la caja que va a afectar',
	})
	boxId: string;

	@Field(() => Number, { description: 'Valor del recibo' })
	value: number;

	@Field(() => String, {
		description: 'Identificador del medio de pago',
	})
	paymentId: string;

	@Field(() => String, {
		description: 'Concepto del recibo',
	})
	concept: string;

	@Field(() => [DetailReceiptOrder], {
		description: 'Pedidos a los que afecta el recibo',
		nullable: true,
	})
	details?: DetailReceiptOrder[];
}

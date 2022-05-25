import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Datos para crear un recibo de caja' })
export class CreateReceiptInput {
	@Field(() => String, {
		description: 'Identificador de la caja que va a afectar',
		nullable: true,
	})
	boxId?: string;

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
}

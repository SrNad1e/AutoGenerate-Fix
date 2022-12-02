import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un crédito' })
export class CreateCreditInput {
	@Field(() => String, {
		description:
			'Identificador del cliente al que se le va a asignar el crédito',
	})
	customerId: string;

	@Field(() => Number, { description: 'Monto de crédigo aprobado' })
	amount: number;
}

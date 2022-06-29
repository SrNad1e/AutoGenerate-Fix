import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear Egreso' })
export class CreateExpenseInput {
	@Field(() => Number, { description: 'Valor del egreso' })
	value: number;

	@Field(() => String, { description: 'Descripción del pago', nullable: true })
	concept?: string;

	@Field(() => String, { description: 'Identificador de la caja' })
	boxId: string;
}

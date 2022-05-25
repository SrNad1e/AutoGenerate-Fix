import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBoxHistoryInput {
	@Field(() => Number, { description: 'Valor de la transacción' })
	value: number;

	@Field(() => String, { description: 'Identificador de la caja' })
	boxId: string;

	@Field(() => String, { description: 'Identificador del documento' })
	documentId: string;

	@Field(() => String, {
		description:
			'Tipo de documento que realiza el movimiento (transfer, expense, receipt)',
	})
	documentType: string;
}

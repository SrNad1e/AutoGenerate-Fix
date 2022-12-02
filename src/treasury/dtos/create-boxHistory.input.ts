import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum StatusBoxHistory {
	TRANSFER = 'transfer',
	EXPENSE = 'expense',
	RECEIPT = 'receipt',
}

registerEnumType(StatusBoxHistory, { name: 'StatusBoxHistory' });

@InputType()
export class CreateBoxHistoryInput {
	@Field(() => Number, { description: 'Valor de la transacción' })
	value: number;

	@Field(() => String, { description: 'Identificador de la caja' })
	boxId: string;

	@Field(() => String, { description: 'Identificador del documento' })
	documentId: string;

	@Field(() => StatusBoxHistory, {
		description: 'Tipo de documento que realiza el movimiento',
	})
	documentType: StatusBoxHistory;
}

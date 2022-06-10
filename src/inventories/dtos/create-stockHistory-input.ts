import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum DocumentTypeStockHistory {
	TRANSFER = 'order',
	INPUT = 'input',
	REFUND = 'refund',
	ADJUSTMENT = 'adjustment',
	OUTPUT = 'output',
	ORDER = 'order',
	RETURNORDER = 'returnOrder',
}

registerEnumType(DocumentTypeStockHistory, {
	name: 'DocumentTypeStockHistory',
});

@InputType()
export class DetailHistory {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de movimiento' })
	quantity: number;
}

@InputType()
export class CreateStockHistoryInput {
	@Field(() => [DetailHistory], { description: 'Detalle de cada producto' })
	details: DetailHistory[];

	@Field(() => String, { description: 'Identificador de la bodega' })
	warehouseId: string;

	@Field(() => String, { description: 'Identificador del documento' })
	documentId: string;

	@Field(() => DocumentTypeStockHistory, {
		description: 'Tipo de documento que realiza el movimiento',
	})
	documentType: DocumentTypeStockHistory;
}

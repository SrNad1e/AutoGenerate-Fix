import { Field, InputType } from '@nestjs/graphql';

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

	@Field(() => String, {
		description:
			'Tipo de documento que realiza el movimiento (transfer, input, refund, adjustment, output, order)',
	})
	documentType: string;
}

import { Field, InputType } from '@nestjs/graphql';

import { DetailHistory } from './add-stockHistory-input';

@InputType()
export class DeleteStockHistoryInput {
	@Field(() => [DetailHistory], { description: 'Detalle de cada producto' })
	details: DetailHistory[];

	@Field(() => String, { description: 'Identificador de la bodega' })
	warehouseId: string;

	@Field(() => String, { description: 'Identificador del documento' })
	documentId: string;

	@Field(() => String, {
		description:
			'Tipo de documento que realiza el movimiento (transfer, output, order, adjustment, invoice)',
	})
	documentType: string;
}

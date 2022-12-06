import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Producto a confirmar en el traslado' })
export class DetailConfirmStockTransferInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para confirmar los productos del traslado' })
export class ConfirmStockTransferInput {
	@Field(() => [DetailConfirmStockTransferInput], {
		description: 'Productos para confirmar',
	})
	details: DetailConfirmStockTransferInput[];
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Producto de la devoliución del pedido' })
export class DetailReturnInput {
	@Field(() => String, { description: 'Identificador del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad del producto' })
	quantity: number;
}

@InputType()
export class CreateReturnOrderInput {
	@Field(() => String, { description: 'Pedido al que afecta la devolución' })
	orderId: string;

	@Field(() => [DetailReturnInput], {
		description: 'Productos que se devuelven del pedido',
	})
	details: DetailReturnInput[];
}

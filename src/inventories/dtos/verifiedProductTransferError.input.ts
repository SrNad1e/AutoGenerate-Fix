import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para verificar los productos' })
export class VerifiedProductTransferErrorInput {
	@Field(() => String, { description: 'Identificador del traslado en error' })
	stockTransferErrorId: string;

	@Field(() => String, { description: 'Identificador del producto' })
	productId: string;

	@Field(() => String, {
		description: 'Motivo por el cual se verifica el producto',
	})
	reason: string;

	@Field(() => Boolean, {
		description:
			'Proceso a realizar, si se envia al origen true, si se envia al destino false',
	})
	returnInventory: boolean;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddProductsOrderInput {
	@Field(() => String, {
		description: 'Id del pedido que se requiere agreagr o editar productos',
	})
	orderId: string;

	@Field(() => [DetailAddProductsOrderInput], {
		description: 'Productos a crear o actualizar',
	})
	details: DetailAddProductsOrderInput[];
}

@InputType()
export class DetailAddProductsOrderInput {
	@Field(() => String, {
		description: 'Identificador Producto agregado al pedido',
	})
	productId: string;

	@Field(() => Number, { description: 'Cantidad de producto agregado' })
	quantity: number;

	@Field(() => String, {
		description: 'Acción a realizar con el producto (create, update, delete)',
	})
	action: string;
}

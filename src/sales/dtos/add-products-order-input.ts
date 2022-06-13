import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum ActionProductsOrder {
	CREATE = 'create',
	UPDATE = 'update',
	DELETE = 'delete',
}

registerEnumType(ActionProductsOrder, { name: 'ActionProductsOrder' });

@InputType({ description: 'Producto que se va a agregar' })
export class DetailAddProductsOrderInput {
	@Field(() => String, {
		description: 'Identificador Producto agregado al pedido',
	})
	productId: string;

	@Field(() => Number, { description: 'Cantidad de producto agregado' })
	quantity: number;

	@Field(() => ActionProductsOrder, {
		description: 'Acción a realizar con el producto',
	})
	action: ActionProductsOrder;
}

@InputType({ description: 'Datos para agregar productos al pedido' })
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

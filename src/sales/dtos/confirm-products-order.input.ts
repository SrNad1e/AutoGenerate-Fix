import { Field, InputType } from '@nestjs/graphql';

import { StatusOrderDetail } from '../entities/order.entity';

@InputType({ description: 'Producto para confirmar en el pedido' })
export class DetailsConfirm {
	@Field(() => String, { description: 'Producto a confirmar' })
	productId: string;

	@Field(() => StatusOrderDetail, {
		description: 'Estado del producto, si es diferente a confirm',
		nullable: true,
	})
	status?: StatusOrderDetail;
}

@InputType({ description: 'Datos para confirmar productos' })
export class ConfirmProductsOrderInput {
	@Field(() => [DetailsConfirm], { description: 'Productos a confirmar' })
	details: DetailsConfirm[];

	@Field(() => String, {
		description: 'Identificador del pedido a confirmar productos',
	})
	orderId: string;
}

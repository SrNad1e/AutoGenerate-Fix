import { Field, InputType } from '@nestjs/graphql';

import { StatusOrderDetail } from '../entities/order.entity';

@InputType({ description: 'Producto para confirmar en el pedido' })
export class PaymentConfirm {
	@Field(() => String, { description: 'Médio de pago a confirmar' })
	paymentId: string;

	@Field(() => StatusOrderDetail, {
		description: 'Estado del producto, si es diferente a confirm',
		nullable: true,
	})
	status?: StatusOrderDetail;
}

@InputType({ description: 'Datos para confirmar productos' })
export class ConfirmPaymentsOrderInput {
	@Field(() => [PaymentConfirm], { description: 'Pagos a confirmar' })
	payments: PaymentConfirm[];

	@Field(() => String, {
		description: 'Identificador del pedido a confirmar los pagos',
	})
	orderId: string;
}

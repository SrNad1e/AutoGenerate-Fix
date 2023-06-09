import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Medio de pago del producto' })
export class PaymentInvoiceInput {
	@Field(() => String, { description: 'Identificador del pago' })
	paymentId: string;

	@Field(() => Number, { description: 'Valor total del pago' })
	total: number;
}

@InputType({ description: 'Producto de la factura' })
export class DetailInvoiceInput {
	@Field(() => String, { description: 'Identificador del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad del producto' })
	quantity: number;

	@Field(() => Number, { description: 'Precio del producto' })
	price: number;

	@Field(() => Number, { description: 'Descuento del producto' })
	discount: number;
}

@InputType({ description: 'Datos para crear una factura' })
export class CreateInvoiceInput {
	@Field(() => String, { description: 'Identificador de pedido' })
	orderId: string;

	@Field(() => String, {
		description: 'Identificador de punto de venta',
		nullable: true,
	})
	pointOfSaleId?: string;
}

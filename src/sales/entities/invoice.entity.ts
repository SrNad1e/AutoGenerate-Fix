import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Customer } from 'src/crm/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthorizationDian } from './authorization.entity';

@ObjectType()
export class DetailInvoice {
	@Field(() => Product, { description: 'Producto agregado al pedido' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de productos en el pedido' })
	quantity: number;
}

@ObjectType()
export class PaymentInvoice {
	@Field(() => Payment, { description: 'Método de pago usado' })
	payment: Payment;

	@Field(() => Number, { description: 'Total pagado' })
	total: number;
}

@ObjectType()
export class SummaryInvoice {
	@Field(() => Number, { description: 'Total del pedido' })
	total: number;

	@Field(() => Number, { description: 'Descuento del pedido' })
	discount: number;

	@Field(() => Number, { description: 'Subtotal del pedido' })
	subtotal: number;

	@Field(() => Number, { description: 'Impuestos del pedido' })
	tax: number;

	@Field(() => Number, { description: 'Cambio del pedido' })
	change: number;

	@Field(() => Number, { description: 'Total pago del pedido' })
	totalPaid: number;
}

@Schema({ timestamps: true })
@ObjectType()
export class Invoice extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => AuthorizationDian, {
		description: 'Autorización de facturación',
	})
	@Prop({ type: Number, required: true })
	autorization: AuthorizationDian;

	@Field(() => Number, { description: 'Número de factura' })
	@Prop({ type: Number, default: 0 })
	number: number;

	@Field(() => Customer, { description: 'Cliente para la factura' })
	@Prop({
		type: Object,
		required: true,
	})
	customer: Customer;

	@Field(() => Shop, { description: 'Tienda donde se realiza la factura' })
	@Prop({
		type: Object,
		required: true,
	})
	shop: Shop;

	@Field(() => [PaymentInvoice], {
		description: 'Métodos de pago usados en la factura',
		nullable: true,
	})
	@Prop({
		type: Object,
	})
	payments: PaymentInvoice[];

	@Field(() => Boolean, {
		description: 'La factura se encuentra activa o no',
	})
	@Prop({
		type: Boolean,
		default: true,
	})
	active: boolean;

	@Field(() => SummaryInvoice, { description: 'Resumen de los pagosy totales' })
	@Prop({ type: Object })
	summary: SummaryInvoice;

	@Field(() => [DetailInvoice], {
		description: 'Productos que tiene el pedido',
		nullable: true,
	})
	@Prop({ type: Array })
	details: DetailInvoice[];

	@Field(() => User, {
		description: 'Usuario que creó o editó el pedido',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updateAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from '../../crm/entities/customer.entity';
import { Invoice } from './invoice.entity';

@ObjectType()
export class DetailOrder {
	@Field(() => Product, { description: 'Producto agregado al pedido' })
	product: Product;

	@Field(() => String, { description: 'Estado del producto (new, confirmed)' })
	status: string;

	@Field(() => Number, { description: 'Cantidad de productos en el pedido' })
	quantity: number;

	@Field(() => Number, { description: 'Descuento del producto en el pedido' })
	discount: number;

	@Field(() => Number, { description: 'Precio del producto en el pedido' })
	price: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del producto al pedido',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizado del producto al pedido',
	})
	updateAt: Date;
}

@ObjectType()
export class PaymentOrder {
	@Field(() => Payment, { description: 'Método de pago usado' })
	payment: Payment;

	@Field(() => Number, { description: 'Total pagado' })
	total: number;

	@Field(() => Date, {
		description: 'Fecha de agregado del pago al pedido',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizado del pago al pedido',
	})
	updateAt: Date;
}

@ObjectType()
export class SummaryOrder {
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
export class Order extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número de pedido' })
	@Prop({ type: Number, default: 0 })
	number: number;

	@Field(() => Customer, { description: 'Cliente que solicita el pedido' })
	@Prop({
		type: Object,
		required: true,
	})
	customer: Customer;

	@Field(() => Shop, { description: 'Tienda donde se solicita el pedido' })
	@Prop({
		type: Object,
		required: true,
	})
	shop: Shop;

	@Field(() => [PaymentOrder], {
		description: 'Métodos de pago usados en el pedido',
		nullable: true,
	})
	@Prop({
		type: Object,
	})
	payments: PaymentOrder[];

	@Field(() => String, {
		description:
			'Estado del pedido (open, pending, cancelled, closed, sent, invoiced)',
	})
	@Prop({
		type: String,
		default: 'open',
	})
	status: string;

	@Field(() => Invoice, {
		description: 'Factura generada al facturar',
		nullable: true,
	})
	@Prop({
		type: Types.ObjectId,
		ref: 'Invoice',
		autopopulate: true,
	})
	invoice?: Types.ObjectId;

	@Field(() => SummaryOrder, { description: 'Resumen de los pagosy totales' })
	@Prop({ type: Object })
	summary: SummaryOrder;

	@Field(() => [DetailOrder], {
		description: 'Productos que tiene el pedido',
		nullable: true,
	})
	@Prop({ type: Array })
	details: DetailOrder[];

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

export const OrderSchema = SchemaFactory.createForClass(Order);
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { Customer } from '../../crm/entities/customer.entity';

@ObjectType()
export class DetailOrder {
	@Field(() => Product, { description: 'Producto agregado al pedido' })
	product: Product;

	@Field(() => String, { description: 'Estado del producto (new, confirmed)' })
	status: string;

	@Field(() => Number, { description: 'Cantidad de productos en el pedido' })
	quantity: number;

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
	payments: Payment;

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
		type: Types.ObjectId,
		ref: Customer.name,
		autopopulate: true,
		required: true,
	})
	customer: Types.ObjectId;

	@Field(() => Shop, { description: 'Tienda donde se solicita el pedido' })
	@Prop({
		type: Types.ObjectId,
		ref: Shop.name,
		autopopulate: true,
		required: true,
	})
	shop: Types.ObjectId;

	@Field(() => [PaymentOrder], {
		description: 'Métodos de pago usados en el pedido',
		nullable: true,
	})
	@Prop({
		type: Object,
	})
	payments: PaymentOrder[];

	@Field(() => String, {
		description: 'Estado del pedido (open, cancelled, closed, sent, invoiced)',
	})
	@Prop({
		type: String,
		default: 'open',
	})
	status: string;

	@Field(() => [DetailOrder], {
		description: 'Productos que tiene la orden',
		nullable: true,
	})
	@Prop({ type: Object })
	details: DetailOrder[];

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updateAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

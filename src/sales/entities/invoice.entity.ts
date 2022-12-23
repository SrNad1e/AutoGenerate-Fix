import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Shop } from 'src/configurations/entities/shop.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Customer } from 'src/crm/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { AuthorizationDian } from './authorization.entity';
import { Order } from './order.entity';

@ObjectType({ description: 'Productos de la factura' })
export class DetailInvoice {
	@Field(() => Product, { description: 'Producto agregado a la factura' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de productos en la factura' })
	quantity: number;

	@Field(() => Number, { description: 'Descuento del producto en la factura' })
	discount: number;

	@Field(() => Number, { description: 'Precio del producto en la factura' })
	price: number;
}

@ObjectType({ description: 'Medios de pago de la factura' })
export class PaymentInvoice {
	@Field(() => Payment, { description: 'Método de pago usado' })
	payment: Payment;

	@Field(() => Number, { description: 'Total pagado' })
	total: number;
}

@ObjectType({ description: 'Resumen de la factura' })
export class SummaryInvoice {
	@Field(() => Number, { description: 'Total de la factura' })
	total: number;

	@Field(() => Number, { description: 'Descuento de la factura' })
	discount: number;

	@Field(() => Number, { description: 'Subtotal de la factura' })
	subtotal: number;

	@Field(() => Number, { description: 'Impuestos de la factura' })
	tax: number;

	@Field(() => Number, { description: 'Cambio de la factura' })
	change: number;

	@Field(() => Number, { description: 'Total pago de la factura' })
	totalPaid: number;
}

@Schema({ timestamps: true })
@ObjectType({ description: 'Factura' })
export class Invoice extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => AuthorizationDian, {
		description: 'Autorización de facturación',
	})
	@Prop({ type: Object, required: true })
	authorization: AuthorizationDian;

	@Field(() => Number, { description: 'Número de factura' })
	@Prop({ type: Number, default: 0 })
	number: number;

	@Field(() => Customer, { description: 'Cliente para la factura' })
	@Prop({
		type: Object,
		required: true,
	})
	customer: Customer;

	@Field(() => Order, { description: 'Pedido basado para la factura' })
	@Prop({
		type: Types.ObjectId,
		ref: 'Order',
		required: true,
	})
	order: Types.ObjectId;

	@Field(() => Company, {
		description: 'Empresa a la que perteneces la factura',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
	})
	company: Types.ObjectId;

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

	@Field(() => SummaryInvoice, {
		description: 'Resumen de los pagos y totales',
	})
	@Prop({ type: Object })
	summary: SummaryInvoice;

	@Field(() => [DetailInvoice], {
		description: 'Productos de la factura',
		nullable: true,
	})
	@Prop({ type: Array })
	details: DetailInvoice[];

	@Field(() => User, {
		description: 'Usuario que creó o editó la factrura',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Conveyor } from 'src/configurations/entities/conveyor.entity';
import { Shop } from 'src/configurations/entities/shop.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { Receipt } from 'src/treasury/entities/receipt.entity';
import { Address, Customer } from '../../crm/entities/customer.entity';
import { Invoice } from './invoice.entity';
import { PointOfSale } from './pointOfSale.entity';

export enum StatusOrder {
	OPEN = 'open',
	PENDING = 'pending',
	CANCELLED = 'cancelled',
	CLOSED = 'closed',
	SENT = 'sent',
}

registerEnumType(StatusOrder, { name: 'StatusOrder' });

export enum StatusOrderDetail {
	NEW = 'new',
	CONFIRMED = 'confirmed',
}

registerEnumType(StatusOrderDetail, { name: 'StatusOrderDetail' });

@ObjectType({ description: 'Transportadora que realiza el envio' })
export class ConveyorOrder {
	@Field(() => Number, { description: 'Valor del envío' })
	value: number;

	@Field(() => String, {
		description: 'Código de la guia del transportista',
		nullable: true,
	})
	guideCode?: string;

	@Field(() => Conveyor, { description: 'Datos del transportista' })
	conveyor: Conveyor;

	@Field(() => String, {
		description: 'Error del médio de pago',
		nullable: true,
	})
	error?: string;

	@Field(() => Date, {
		description: 'Fecha en el que se realiza el envío',
		nullable: true,
	})
	shippingDate?: Date;
}

@ObjectType({ description: 'Productos del pedido' })
export class DetailOrder {
	@Field(() => Product, { description: 'Producto agregado al pedido' })
	product: Product;

	@Field(() => StatusOrderDetail, { description: 'Estado del producto' })
	status: StatusOrderDetail;

	@Field(() => Number, { description: 'Cantidad de productos en el pedido' })
	quantity: number;

	@Field(() => Number, { description: 'Cantidad de productos devueltos' })
	quantityReturn: number;

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
	updatedAt: Date;
}

@ObjectType({ description: 'Medio de pago usado en el pedido' })
export class PaymentOrder {
	@Field(() => Payment, { description: 'Método de pago usado' })
	payment: Payment;

	@Field(() => Number, { description: 'Total pagado' })
	total: number;

	@Field(() => Receipt, { description: 'Total pagado', nullable: true })
	receipt?: Types.ObjectId;

	@Field(() => String, {
		description: 'Cupón solo válido para el medio de pago tipo coupon',
		nullable: true,
	})
	code?: string;

	@Field(() => StatusOrderDetail, { description: 'Estado del pago' })
	status: StatusOrderDetail;

	@Field(() => Date, {
		description: 'Fecha de agregado del pago al pedido',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualizado del pago al pedido',
	})
	updatedAt: Date;
}

@ObjectType({ description: 'Datos de resumen del pedido' })
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
@ObjectType({ description: 'Pedido de productos' })
export class Order extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Número de pedido' })
	@Prop({ type: Number, required: true })
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

	@Field(() => Boolean, { description: 'Pedido de POS' })
	@Prop({
		type: Boolean,
		default: true,
	})
	orderPos: boolean;

	@Field(() => [PaymentOrder], {
		description: 'Métodos de pago usados en el pedido',
		nullable: true,
	})
	@Prop({
		type: Object,
		default: [],
	})
	payments: PaymentOrder[];

	@Field(() => StatusOrder, {
		description: 'Estado del pedido',
	})
	@Prop({
		type: String,
		default: 'open',
	})
	status: StatusOrder;

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
	@Prop({
		type: Object,
		default: {
			total: 0,
			discount: 0,
			subtotal: 0,
			tax: 0,
			change: 0,
			totalPaid: 0,
		},
	})
	summary: SummaryOrder;

	@Field(() => [DetailOrder], {
		description: 'Productos que tiene el pedido',
		nullable: true,
	})
	@Prop({ type: Array, default: [] })
	details: DetailOrder[];

	@Field(() => PointOfSale, { description: 'Punto de venta asigando' })
	@Prop({
		type: Types.ObjectId,
		ref: PointOfSale.name,
		autopopulate: true,
	})
	pointOfSale: Types.ObjectId;

	@Field(() => Company, {
		description: 'Empresa a la que perteneces el pedido',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
	})
	company: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario que creó o editó el pedido',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Address, {
		description: 'Usuario que creó o editó el pedido',
		nullable: true,
	})
	@Prop({ type: Object })
	address?: Address;

	@Field(() => ConveyorOrder, {
		description: 'Trasportadora',
		nullable: true,
	})
	@Prop({ type: Object })
	conveyorOrder?: ConveyorOrder;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

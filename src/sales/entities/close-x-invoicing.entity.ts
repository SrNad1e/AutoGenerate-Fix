import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { PointOfSale } from './pointOfSale.entity';
import { Expense } from 'src/treasury/entities/expense.entity';
import { User } from 'src/configurations/entities/user.entity';

@ObjectType({ description: 'Arqueo de caja' })
export class CashRegister {
	@Field(() => Number, { description: 'Moneda de 50' })
	M50: number;

	@Field(() => Number, { description: 'Moneda de $ 100' })
	M100: number;

	@Field(() => Number, { description: 'Moneda de $ 200' })
	M200: number;

	@Field(() => Number, { description: 'Moneda de $ 500' })
	M500: number;

	@Field(() => Number, { description: 'Billete o moneda de $ 1.000' })
	B1000: number;

	@Field(() => Number, { description: 'Billete de $ 2.000' })
	B2000: number;

	@Field(() => Number, { description: 'Billete de $ 5.000' })
	B5000: number;

	@Field(() => Number, { description: 'Billete de $ 10.000' })
	B10000: number;

	@Field(() => Number, { description: 'Billete de $ 20.000' })
	B20000: number;

	@Field(() => Number, { description: 'Billete de $ 50.000' })
	B50000: number;

	@Field(() => Number, { description: 'Billete de $ 100.000' })
	B100000: number;
}

@ObjectType({ description: 'Resumen de las ordenes' })
export class SummaryOrderClose {
	@Field(() => Number, { description: 'Cantidad de las ordenes finalizadas' })
	quantityClosed: number;

	@Field(() => Number, { description: 'Cantidad de las ordenes abiertas' })
	quantityOpen: number;

	@Field(() => Number, { description: 'Cantidad de las ordenes canceladas' })
	quantityCancel: number;

	@Field(() => Number, { description: 'Valor de las ordenes finalizadas' })
	value: number;

	@Field(() => Number, { description: 'Valor de los cupones redimidos' })
	valueCoupons: number;

	@Field(() => Number, { description: 'Cantidad de los cupones redimidos' })
	quantityCoupons: number;
}

@ObjectType({ description: 'Resumen de los pagos' })
export class PaymentOrderClose {
	@Field(() => Number, { description: 'Cantidad de las pagos del medio' })
	quantity: number;

	@Field(() => Number, { description: 'Valor del medio de pago' })
	value: number;

	@Field(() => Payment, {
		description: 'Medio de pago',
	})
	payment: Types.ObjectId;
}

@ObjectType({ description: 'Resumen de los pagos' })
export class RefundOrderClose {
	@Field(() => Number, {
		description: 'Cantidad de productos devueltos',
		nullable: true,
	})
	quantity: number;

	@Field(() => Number, {
		description: 'Valor de las devoluciones',
		nullable: true,
	})
	value: number;
}

@ObjectType({ description: 'Pagos que cruzan créditos' })
export class PaymentCredit {
	@Field(() => Number, { description: 'Cantidad de las pagos del medio' })
	quantity: number;

	@Field(() => Number, { description: 'Valor del medio de pago' })
	value: number;

	@Field(() => Payment, {
		description: 'Medio de pago',
	})
	payment: Types.ObjectId;
}

@Schema({ timestamps: true, collection: 'closesXInvoicing' })
@ObjectType({ description: 'Cierre X de facturación' })
export class CloseXInvoicing extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => CashRegister, {
		description: 'Listado de billetes y monedas registrados',
	})
	@Prop({ type: Object, requiere: true })
	cashRegister: CashRegister;

	@Field(() => Number, { description: 'Número consecutivo' })
	@Prop({ type: Number, requiere: true })
	number: number;

	@Field(() => Company, { description: 'Compañía a la que pertence el cierre' })
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => PointOfSale, {
		description: 'Punto de venta que registra el cierre',
	})
	@Prop({ type: Types.ObjectId, ref: PointOfSale.name, required: true })
	pointOfSale: Types.ObjectId;

	@Field(() => Date, { description: 'Fecha de cierre' })
	@Prop({ type: Date, required: true })
	closeDate: Date;

	@Field(() => SummaryOrderClose, { description: 'Datos de las ordenes' })
	@Prop({ type: Object, requiere: true })
	summaryOrder: SummaryOrderClose;

	@Field(() => [Expense], { description: 'Egresos del día', nullable: true })
	@Prop({ type: [Types.ObjectId], default: [] })
	expenses?: Types.ObjectId[];

	@Field(() => RefundOrderClose, {
		description: 'Devoluciones generadas',
		nullable: true,
	})
	@Prop({ type: Array, default: {} })
	refunds: RefundOrderClose;

	@Field(() => [PaymentOrderClose], {
		description: 'Listado de pagos',
		nullable: true,
	})
	@Prop({ type: Object, default: [] })
	payments: PaymentOrderClose[];

	@Field(() => [PaymentCredit], {
		description: 'Medios de pago usados para cruzar créditos',
		nullable: true,
	})
	@Prop({ type: Array })
	paymentsCredit?: PaymentCredit[];

	@Field(() => Number, {
		description: 'Transacciones reportadas por el usuario',
	})
	@Prop({ type: Object, default: 0 })
	quantityBank: number;

	@Field(() => User, {
		description: 'Usuario que creó o editó el cierre',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CloseXInvoicingSchema =
	SchemaFactory.createForClass(CloseXInvoicing);

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { PointOfSale } from './pointOfSale.entity';
import { Expense } from 'src/treasury/entities/expense.entity';
import {
	CashRegister,
	PaymentCredit,
	PaymentOrderClose,
	RefundOrderClose,
	SummaryOrderClose,
} from './close-x-invoicing.entity';
import { User } from 'src/configurations/entities/user.entity';

export enum VerifiedClose {
	VERIFIED = 'verified',
	UNVERIFIED = 'unverified',
}

registerEnumType(VerifiedClose, {
	name: 'VerifiedClose',
});

@Schema({ timestamps: true, collection: 'closesZInvoicing' })
@ObjectType({ description: 'Cierre Z de facturación' })
export class CloseZInvoicing extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => CashRegister, {
		description: 'Listado de billetes y monedas registrados',
	})
	@Prop({ type: Object, requiere: true })
	cashRegister: CashRegister;

	@Field(() => String, { description: 'Prefijo del número' })
	@Prop({ type: String, requiere: true })
	prefix: string;

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

	@Field(() => [PaymentCredit], {
		description: 'Medios de pago usados para cruzar créditos',
		nullable: true,
	})
	@Prop({ type: Object })
	paymentsCredit?: PaymentCredit[];

	@Field(() => Date, { description: 'Fecha de cierre' })
	@Prop({ type: Date, required: true })
	closeDate: Date;

	@Field(() => VerifiedClose, {
		description: 'si el cierre ha sido verificado',
	})
	@Prop({ type: String })
	verifiedStatus: VerifiedClose;

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

	@Field(() => Number, {
		description: 'Transacciones reportadas por el usuario',
	})
	@Prop({ type: Object, default: 0 })
	quantityBank: number;

	@Field(() => Number, {
		description: 'Ventas por datafono reportadas por el usuario',
		nullable: true
	})
	@Prop({ type: Object, default: 0 })
	quantityDataphone?: number;

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

export const CloseZInvoicingSchema =
	SchemaFactory.createForClass(CloseZInvoicing);

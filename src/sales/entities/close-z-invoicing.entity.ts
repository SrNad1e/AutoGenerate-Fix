import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { PointOfSale } from './pointOfSale.entity';
import { Expense } from 'src/treasury/entities/expense.entity';
import {
	CashRegister,
	PaymentOrderClose,
	RefundOrderClose,
	SummaryOrderClose,
} from './close-x-invoicing.entity';
import { User } from 'src/configurations/entities/user.entity';

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

export const CloseZInvoicingSchema =
	SchemaFactory.createForClass(CloseZInvoicing);

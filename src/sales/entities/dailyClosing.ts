import { Payment } from './../../treasury/entities/payment.entity';
import { Company } from './../../configurations/entities/company.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { PointOfSale } from './pointOfSale.entity';
import { Invoice } from './invoice.entity';

@ObjectType({ description: 'Resumen del cierre' })
export class SummaryClose {
	@Field(() => Number, { description: 'Total del cierre' })
	total: number;

	@Field(() => Number, { description: 'Subtotal del cierre' })
	subtotal: number;

	@Field(() => Number, { description: 'Impuestos del cierre' })
	tax: number;
}

@ObjectType({ description: 'Resumen pagos del cierre' })
export class SummaryPayment {
	@Field(() => Number, { description: 'Total pagado' })
	total: number;

	@Field(() => Number, { description: 'Cantidad' })
	quantity: number;

	@Field(() => Payment, { description: 'Medios de pago' })
	payment: Types.ObjectId;
}

@Schema({ timestamps: true, collection: 'dailyclosing' })
@ObjectType({ description: 'Cierre diario' })
export class DailyClosing extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Company, { description: 'Compañía a la que pertence el cierre' })
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => Date, { description: 'Fecha de cierre' })
	@Prop({ type: Date, required: true })
	closeDate: Date;

	@Field(() => PointOfSale, {
		description: 'Punto de venta que registra el cierre',
	})
	@Prop({ type: Types.ObjectId, ref: PointOfSale.name, required: true })
	pointOfSale: Types.ObjectId;

	@Field(() => [Invoice], {
		description: 'Facturas del cierre',
	})
	@Prop({ type: [Types.ObjectId], ref: Invoice.name, default: [] })
	invoices: Types.ObjectId[];

	@Field(() => SummaryClose, { description: 'Resumen del cierre' })
	@Prop({ type: Object, required: true })
	summary: SummaryClose;

	@Field(() => [SummaryPayment], { description: 'Resumen de pagos del cierre' })
	@Prop({ type: [Types.ObjectId], ref: SummaryPayment.name, default: [] })
	summaryPayments: Types.ObjectId[];

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

export const DailyClosingSchema = SchemaFactory.createForClass(DailyClosing);

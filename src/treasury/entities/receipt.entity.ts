import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Box } from './box.entity';
import { Payment } from './payment.entity';

export enum StatusReceipt {
	ACTIVE = 'active',
	CANCELLED = 'cancelled',
}

registerEnumType(StatusReceipt, { name: 'StatusReceipt' });

@Schema({ timestamps: true })
@ObjectType({ description: 'Egreso de dinero' })
export class Receipt extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Number, { description: 'Consecutivo del recibo de caja' })
	@Prop({ type: Number, default: 0 })
	number: number;

	@Field(() => Number, { description: 'Valor del recibo de caja' })
	@Prop({ type: Number, default: 0 })
	value: number;

	@Field(() => String, {
		description: 'Concepto del recibo de caja',
		nullable: true,
	})
	@Prop({ type: String })
	concept: string;

	@Field(() => StatusReceipt, {
		description: 'Estado del recibo de caja',
	})
	@Prop({ type: String, default: 'active' })
	status: StatusReceipt;

	@Field(() => Payment, {
		description: 'Método de pago del recibo de caja',
	})
	@Prop({
		type: Object,
	})
	payment: Payment;

	@Field(() => Box, {
		description: 'Caja afectada por el recibo si es efectivo',
		nullable: true,
	})
	@Prop({
		type: Types.ObjectId,
		ref: 'Box',
	})
	box?: Types.ObjectId;

	@Field(() => Company, {
		description: 'Empresa a la que pertenece el recibo de caja',
	})
	@Prop({
		type: Types.ObjectId,
		ref: 'Company',
		autopopulate: true,
	})
	company: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario que creó o editó el recibo de caja',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);

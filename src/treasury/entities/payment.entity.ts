import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Image } from 'src/configurations/entities/image.entity';

export enum TypePayment {
	CASH = 'cash',
	BANK = 'bank',
	CREDIT = 'credit',
	BONUS = 'bonus',
}

registerEnumType(TypePayment, { name: 'TypePayment' });

@Schema({ timestamps: true })
@ObjectType({ description: 'Medios de pago' })
export class Payment extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del medio de pago' })
	@Prop({ type: String, unique: true })
	name: string;

	@Field(() => TypePayment, {
		description: 'Tipo de medio de pago',
	})
	@Prop({ type: String, required: true })
	type: TypePayment;

	@Field(() => String, {
		description: 'Color del medio de pago',
		nullable: true,
	})
	@Prop({ type: String })
	color?: string;

	@Field(() => Image, {
		description: 'Logo para el medio de pago',
		nullable: true,
	})
	@Prop({ type: Types.ObjectId, ref: Image.name })
	logo?: Types.ObjectId;

	@Field(() => Boolean, {
		description: 'Estado del tipo de los médios de pago',
	})
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => User, {
		description: 'Usuario que creó o editó el medio de pago',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

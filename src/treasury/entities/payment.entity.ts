import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Image } from 'src/staticfiles/entities/image.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Medios de pago' })
export class Payment extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del medio de pago' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, {
		description: 'Tipo de medio de pago (cash, bank, credit, bonus)',
	})
	@Prop({ type: String, required: true })
	type: string;

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

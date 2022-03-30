import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Payment extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del medio de pago' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, {
		description: 'Tipo de medio de pago (cash, bank, credit)',
	})
	@Prop({ type: String, required: true })
	type: string;

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

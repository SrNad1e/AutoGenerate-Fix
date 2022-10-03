import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from './user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Tokens para validaciones' })
export class Token extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => User, {
		description: 'Usuario al que pertenece el token',
	})
	@Prop({ type: Types.ObjectId, ref: User.name, required: true })
	user: Types.ObjectId;

	@Field(() => String, {
		description: 'Código del token',
	})
	@Prop({ type: String, required: true })
	code: string;

	@Field(() => Date, { description: 'Fecha de vencimiento del token' })
	@Prop({ type: Date, required: true })
	expirationDate: Date;

	@Field(() => Boolean, { description: 'Estado del token' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => Date, { description: 'Nombre de usuario' })
	createdAt: Date;

	@Field(() => Date, { description: 'Nombre de usuario' })
	updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

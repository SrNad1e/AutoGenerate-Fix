import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { User } from '../../configurations/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Zona de envios' })
export class Zone extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	@Field(() => String, {
		description: 'Nombre de las zonas',
	})
	name: string;

	@Prop({ type: String, required: true, trim: true, lowercase: true })
	@Field(() => String, { description: 'Descricion de la zona' })
	description: string;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Estado de la zona',
	})
	state: boolean;

	@Field(() => Date, { description: 'Fecha creada de la zona' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de la actualizacion de la zona' })
	updatedAt: Date;

	@Field(() => User, { description: 'Usuario que creó o modificó el rol' })
	@Prop({ type: Object, required: true })
	user: Partial<User>;

}

export const zoneSchema = SchemaFactory.createForClass(Zone);

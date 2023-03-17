import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { User } from '../../configurations/entities/user.entity';
import { Zone } from './zone.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Region de envios' })
export class Region extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	@Field(() => String, {
		description: 'Nombre de la ciudad',
	})
	city: string;

	@Prop({ type: String, required: true, trim: true })
	@Field(() => String, { description: 'Nombre del departamento de la ciudad' })
	dpto: string;

	@Prop({ type: String, required: true, trim: true })
	@Field(() => String, { description: 'Nombre del departamento de la ciudad' })
	country: string;

	@Field(() => Zone, { description: 'Usuario que creó o modificó la ciudad' })
	@Prop({ type: Object, required: true })
	zone: Partial<Zone>;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Estado de la region',
	})
	state: boolean;

	@Field(() => Date, { description: 'Fecha creada de la ciudad' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de la actualizacion de la ciudad' })
	updatedAt: Date;

	@Field(() => User, { description: 'Usuario que creó o modificó la ciudad' })
	@Prop({ type: Object, required: true })
	user: Partial<User>;
}

export const regionSchema = SchemaFactory.createForClass(Region);

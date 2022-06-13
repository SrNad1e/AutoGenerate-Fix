import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

@ObjectType({ description: 'Ciudad de la dirección' })
@Schema({ timestamps: true })
export class City extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la ciudad' })
	@Prop({ type: String })
	name: string;

	@Field(() => String, { description: 'Departamento' })
	@Prop({ type: String })
	state: string;

	@Field(() => String, { description: 'País' })
	@Prop({ type: String })
	country: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó la ciudad',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CitySchema = SchemaFactory.createForClass(City);

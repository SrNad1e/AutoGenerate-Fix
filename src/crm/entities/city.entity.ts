import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ZoneType } from 'src/configurations/entities/conveyor.entity';

import { User } from 'src/configurations/entities/user.entity';

@ObjectType({ description: 'Pais' })
export class Country {
	@Field(() => String, { description: 'Nombre del país' })
	name: string;

	@Field(() => String, { description: 'Prefijo del país' })
	prefix: string;
}

@ObjectType({ description: 'Ciudad de la dirección' })
@Schema({ timestamps: true })
export class City extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la ciudad' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, { description: 'Departamento' })
	@Prop({ type: String, required: true })
	state: string;

	@Field(() => ZoneType, { description: 'Zona a la que pertenece la ciudad' })
	@Prop({ type: String, required: true })
	zone: ZoneType;

	@Field(() => Country, { description: 'País' })
	@Prop({ type: Object, required: true })
	country: Country;

	@Field(() => String, { description: 'Código DANE' })
	@Prop({ type: String, required: true })
	code: string;

	@Field(() => String, { description: 'Código postal' })
	@Prop({ type: String, required: true })
	defaultPostalCode: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó la ciudad',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CitySchema = SchemaFactory.createForClass(City);

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Image } from 'src/configurations/entities/image.entity';
import { User } from './user.entity';

export enum ConveyorType {
	FEDEX = 'FEDEX',
	INTERRAPIDISIMO = 'Interapidisimo',
	REGION = 'region',
}

registerEnumType(ConveyorType, { name: 'ConveyorType' });

@ObjectType({ description: 'Modelo para la transportadora' })
@Schema({ timestamps: true })
export class Conveyor extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la transportadora' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => ConveyorType, { description: 'Tipo de transportadora' })
	@Prop({ type: String, required: true })
	type: ConveyorType;

	@Field(() => String, {
		description: 'Mensaje para el usuario',
		nullable: true,
	})
	@Prop({ type: String })
	message?: string;

	@Field(() => Image, { description: 'Logo de la tranportadora' })
	@Prop({
		type: Types.ObjectId,
		ref: Image.name,
		autopopulate: true,
		required: true,
	})
	logo: Types.ObjectId;

	@Field(() => User, { description: 'Usuario que crea la transportadora' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la transportadora' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la transportadora',
	})
	updatedAt: Date;
}

export const ConveyorSchema = SchemaFactory.createForClass(Conveyor);

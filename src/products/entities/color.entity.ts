import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Image } from 'src/configurations/entities/image.entity';
import { User } from 'src/configurations/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Color del producto' })
export class Color extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del color' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, { description: 'Nombre interno del color' })
	@Prop({ type: String, unique: true, lowercase: true })
	name_internal: string;

	@Field(() => String, { description: 'Color en formato html' })
	@Prop({ type: String, default: '#fff' })
	html: string;

	@Field(() => Image, {
		description: 'Imagen del color',
		nullable: true,
	})
	@Prop({
		type: Types.ObjectId,
		ref: Image.name,
		autopopulate: true,
	})
	image: Types.ObjectId;

	@Field(() => Boolean, { description: 'Estado del color' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea el color' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación del color' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización del color',
	})
	updatedAt: Date;
}

export const ColorSchema = SchemaFactory.createForClass(Color);

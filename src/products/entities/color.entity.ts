import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Color {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: mongoose.ObjectId;

	@Field(() => String, { description: 'Nombre del color' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, { description: 'Nombre interno del color' })
	@Prop({ type: String, required: true })
	name_internal: string;

	@Field(() => String, { description: 'Url de la imagen del color' })
	@Prop({ type: String, required: true })
	html: string;
}

export const ColorSchema = SchemaFactory.createForClass(Color);

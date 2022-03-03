import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Size {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: mongoose.ObjectId;

	@Field(() => String, { description: 'Valor de la talla' })
	@Prop({ type: String, required: true })
	value: string;
}
export const SizeSchema = SchemaFactory.createForClass(Size);

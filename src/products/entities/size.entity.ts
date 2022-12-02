import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Talla del producto' })
export class Size extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Valor de la talla' })
	@Prop({ type: String, required: true })
	value: string;

	@Field(() => Number, { description: 'Peso de la talla para el ordenamiento' })
	@Prop({ type: Number, unique: true })
	weight: number;

	@Field(() => Boolean, { description: 'Estado de la talla' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la talla' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la talla' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la talla',
	})
	updatedAt: Date;

	@Field(() => Number, {
		description: 'Identificador mysql',
		deprecationReason: 'Campo para migración de mysql',
		nullable: true,
	})
	@Prop({ type: Number })
	id: number;
}
export const SizeSchema = SchemaFactory.createForClass(Size);

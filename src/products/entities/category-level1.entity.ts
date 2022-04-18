import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType({ description: 'Categoría del producto nivel 1' })
@Schema({ timestamps: true })
export class CategoryLevel1 extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => String, { description: 'Nombre de la categoría' })
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la categoría' })
	user: User;

	@Field(() => Date, {
		description: 'Fecha de creación de la categoría',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la categoría',
	})
	updatedAt: Date;
}

export const CategoryLevel1Schema =
	SchemaFactory.createForClass(CategoryLevel1);

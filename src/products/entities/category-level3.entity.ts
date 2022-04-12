import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CategoryLevel2 } from './category-level2.entity';

@ObjectType()
@Schema({ timestamps: true })
export class CategoryLevel3 extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => String, { description: 'Nombre de la categoría' })
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la categoría' })
	user: User;

	@Prop({ type: Types.ObjectId })
	@Field(() => CategoryLevel2, { description: 'Categoría padre' })
	categoryParent: Types.ObjectId;

	@Field(() => Date, {
		description: 'Fecha de creación de la categoría',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la categoría',
	})
	updatedAt: Date;
}

export const CategoryLevel3Schema =
	SchemaFactory.createForClass(CategoryLevel3);

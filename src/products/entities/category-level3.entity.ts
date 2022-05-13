import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType({ description: 'Categoría del producto nivel 3' })
@Schema({ timestamps: true })
export class CategoryLevel3 extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, {
		description: 'Nombre de la categoría',
		nullable: true,
	})
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, {
		description: 'Identificador de la categoría padre',
		nullable: true,
	})
	@Prop({
		type: Types.ObjectId,
		ref: 'CategoryLevel2',
		autopopulate: true,
	})
	parentId: Types.ObjectId;

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

export const CategoryLevel3Schema =
	SchemaFactory.createForClass(CategoryLevel3);

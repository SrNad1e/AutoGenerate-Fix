import { Company } from 'src/configurations/entities/company.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { CategoryLevel3 } from './category-level3.entity';

@ObjectType({ description: 'Categoría del producto nivel 2' })
@Schema({ timestamps: true })
export class CategoryLevel2 extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => String, {
		description: 'Nombre de la categoría',
		nullable: true,
	})
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => [CategoryLevel3], {
		description: 'Categorías inferiores',
		nullable: true,
	})
	@Prop({
		type: [Types.ObjectId],
		default: [],
		ref: CategoryLevel3.name,
		autopopulate: true,
	})
	childs?: Types.ObjectId[];

	@Field(() => String, {
		description: 'Identificador de la categoría padre',
		nullable: true,
	})
	@Prop({
		type: Types.ObjectId,
		ref: 'CategoryLevel1',
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

	@Field(() => [Company], { description: 'Compañías' })
	@Prop({ type: Types.ObjectId, ref: Company.name, autopopulate: true })
	companies: Types.ObjectId[];
}

export const CategoryLevel2Schema =
	SchemaFactory.createForClass(CategoryLevel2);

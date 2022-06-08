import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { CategoryLevel2 } from './category-level2.entity';

@ObjectType({ description: 'Categoría del producto nivel 1' })
@Schema({ timestamps: true })
export class CategoryLevel1 extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la categoría' })
	@Prop({ type: String, required: true })
	name: string;

	@Prop({
		type: [Types.ObjectId],
		default: [],
		ref: CategoryLevel2.name,
		autopopulate: true,
	})
	@Field(() => [CategoryLevel2], {
		description: 'Nombre de la categoría',
		nullable: true,
	})
	childs?: Types.ObjectId[];

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

@Entity({ name: 'categories' })
export class CategoryMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'int' })
	parent_id: number;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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

	@Field(() => String, { description: 'Color en formato html' })
	@Prop({ type: String, default: '#fff' })
	html: string;

	@Field(() => String, {
		description: 'Url relativo de la imagen',
		nullable: true,
	})
	@Prop({ type: String, default: '' })
	image: string;

	@Field(() => Boolean, { description: 'Estado del color' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	//TODO: campo de mysql
	@Field(() => Number, {
		description: 'Identificador del color mysql',
		deprecationReason: 'Campo para migración de mysql',
	})
	@Prop({ type: Number, default: true })
	id: number;
}

export const ColorSchema = SchemaFactory.createForClass(Color);

@Entity({ name: 'colors' })
export class ColorMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'tinyint' })
	active: boolean;

	@Column({ type: 'varchar' })
	name_internal: string;

	@Column({ type: 'varchar' })
	image: string;

	@Column({ type: 'varchar' })
	html: string;

	@Column({ type: 'datetime' })
	created_at: Date;
}

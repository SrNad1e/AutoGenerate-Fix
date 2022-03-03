import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
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

	@Field(() => Boolean, { description: 'Estado de la talla' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	//TODO: temporal id de mysql
	@Field(() => Number, {
		description: 'Identificador mysql',
		deprecationReason: 'Id de mysql',
		nullable: true,
	})
	@Prop({ type: Number })
	id: number;
}
export const SizeSchema = SchemaFactory.createForClass(Size);

@Entity({ name: 'sizes' })
export class SizeMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar' })
	value: string;

	@Column({ type: 'tinyint' })
	active: boolean;
}

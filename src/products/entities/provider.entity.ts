/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Document, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Provider extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Prop({ type: String, required: true, unique: true })
	@Field(() => String, { description: 'Nombre del proveedor' })
	name: string;

	@Prop({ type: Boolean, default: true })
	@Field(() => Boolean, { description: 'Estado del proveedor' })
	active: boolean;

	@Prop({ type: Number })
	@Field(() => Boolean, {
		description: 'Id de mysql',
		nullable: true,
		deprecationReason: 'id de mysql',
	})
	id: number;
}

export const ProviderSchema = SchemaFactory.createForClass(Provider);

@Entity({ name: 'providers' })
export class ProviderMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar' })
	name: string;
}

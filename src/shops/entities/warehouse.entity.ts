/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Warehouse extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la bodega' })
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Field(() => Boolean, { description: 'Estado de la bodega' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => Number, {
		description: 'Máxima cantidad de productos en la bodega',
	})
	@Prop({ type: Number, required: true })
	max: number;

	@Field(() => Number, {
		description: 'Mínima cantidad de productos en la bodega',
	})
	@Prop({ type: Number, required: true })
	min: number;

	@Field(() => User, { description: 'Usuario que creó el usuario' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de creación' })
	updatedAt: Date;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);

@Entity({ name: 'warehouses' })
export class WarehouseMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	shop_id: number;
}

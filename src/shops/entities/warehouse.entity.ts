/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Shop } from './shop.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Warehouse extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => Shop, { description: 'Tienda a la que pertenece' })
	@Prop({ type: Object, required: true })
	shop: Shop;

	@Field(() => String, { description: 'Nombre de la bodega' })
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Field(() => Boolean, { description: 'Estado de la bodega' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => User, { description: 'Usuario que creó el usuario' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Number, {
		description: 'ID Mysql',
		deprecationReason: 'Mysql migración',
		nullable: true,
	})
	@Prop({ type: Number })
	id: number;
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

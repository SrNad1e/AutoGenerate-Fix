/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Shop } from './shop.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Warehouse extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => Shop, { description: 'Tienda a la que pertenece' })
	@Prop({ type: Number, required: true })
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
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);

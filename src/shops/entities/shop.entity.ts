import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { Warehouse } from './warehouse.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Shop extends mongoose.Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: mongoose.ObjectId;

	@Field(() => String, { description: 'Nombre de la tienda' })
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Field(() => String, {
		description: 'Estado de la tienda (active, inactive, suspend)',
	})
	@Prop({ type: String, default: 'active' })
	status: string;

	@Field(() => String, { description: 'Dirección de la tienda' })
	@Prop({ type: String, required: true })
	address: string;

	@Field(() => String, { description: 'Teléfono de la tienda', nullable: true })
	@Prop({ type: String })
	phone: string;

	@Field(() => Number, { description: 'Méta asiganda a la tienda' })
	@Prop({ type: Number, default: 0 })
	goal: number;

	@Field(() => Warehouse, {
		description: 'Bodega predeterminada para la tienda',
	})
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Warehouse.name,
		autopopulate: true,
		required: true,
	})
	defaultWarehouse: mongoose.Schema.Types.ObjectId;

	@Field(() => Boolean, { description: 'Es centro de distribución' })
	@Prop({ type: Boolean, default: false })
	isMain: boolean;

	@Field(() => Warehouse, {
		description: 'Bodega de centro de distribución asignado',
		nullable: true,
	})
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Warehouse.name,
		autopopulate: true,
	})
	warehouseMain: mongoose.Schema.Types.ObjectId;

	@Field(() => User, { description: 'Usuario que crea la tienda' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de creación' })
	updatedAt: Date;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

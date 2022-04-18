import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { Warehouse } from './warehouse.entity';
import { Company } from 'src/configurations/entities/company.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Shop extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

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

	@Field(() => Number, { description: 'Meta asiganda a la tienda' })
	@Prop({ type: Number, default: 0 })
	goal: number;

	@Field(() => Warehouse, {
		description: 'Bodega predeterminada para la tienda',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Warehouse.name,
		autopopulate: true,
		required: true,
	})
	defaultWarehouse: Types.ObjectId;

	@Field(() => Warehouse, {
		description: 'Empresa que usa la tienda',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
		required: true,
	})
	company: Types.ObjectId;

	@Field(() => Boolean, { description: 'Es centro de distribución' })
	@Prop({ type: Boolean, default: false })
	isMain: boolean;

	@Field(() => Warehouse, {
		description: 'Bodega de centro de distribución asignado',
		nullable: true,
	})
	@Prop({
		type: Types.ObjectId,
		ref: Warehouse.name,
		autopopulate: true,
	})
	warehouseMain: Types.ObjectId;

	@Field(() => User, { description: 'Usuario que crea la tienda' })
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de creación' })
	updatedAt: Date;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

@Entity({ name: 'shops' })
export class ShopMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	owner_user_id: number;

	@Column({ type: 'varchar' })
	address: string;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar' })
	phone: string;

	@Column({ type: 'tinyint' })
	active: boolean;

	@Column({ type: 'datetime' })
	created_at: string;
}

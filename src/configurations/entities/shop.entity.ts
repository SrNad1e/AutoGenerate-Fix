import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { Warehouse } from './warehouse.entity';
import { User } from 'src/configurations/entities/user.entity';

export enum StatusShop {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPEND = 'suspend',
}

registerEnumType(StatusShop, { name: 'StatusShop' });

@ObjectType({description: 'Historial de metas de la tienda'})
export class GoalHistory {
    @Field(() => Date, { description: 'Fecha del registro' })
	@Prop({ type: Date, required: true })
	date: Date;

	@Field(() => Number, { description: 'Meta de la tienda' })
	@Prop({ type: Number })
	goal: number;

    @Field(() => Number, { description: 'Meta alcanzada por la tienda' })
	@Prop({ type: Number })
	goalAchieved: number;
}

@Schema({ timestamps: true })
@ObjectType()
export class Shop extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => [GoalHistory], {
		description: 'Historico de metas de la tienda',
		nullable: true,
	})
	@Prop({ type: Array, default: [] })
	goalHistory: GoalHistory[];

	@Field(() => String, { description: 'Nombre de la tienda' })
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Field(() => String, { description: 'Correo de la tienda', nullable: true })
	@Prop({ type: String })
	email?: string;
	@Field(() => String, {
		description: 'Documento de la tienda(NIT)',
		nullable: true,
	})
	@Prop({ type: String })
	document?: string;

	@Field(() => String, {
		description: 'Nombre comercial de la tienda',
		nullable: true,
	})
	@Prop({ type: String })
	companyName?: string;

	@Field(() => StatusShop, {
		description: 'Estado de la tienda',
	})
	@Prop({ type: String, default: 'active' })
	status: StatusShop;

	@Field(() => String, {
		description: 'Dirección de la tienda',
		nullable: true,
	})
	@Prop({ type: String })
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
		ref: 'Company',
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

/*@Entity({ name: 'shops' })
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
}*/

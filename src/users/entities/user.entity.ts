import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Shop } from 'src/shops/entities/shop.entity';
import { Role } from './role.entity';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';
import { CustomerType } from 'src/crm/entities/customerType.entity';
import { Company } from 'src/configurations/entities/company.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Usuario que manipula los datos de la aplicación' })
export class User extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	@Field(() => String, {
		description: 'Nombre de para mostrar del usuario',
	})
	name: string;

	@Prop({ type: String, required: true, trim: true })
	@Field(() => String, { description: 'Cuenta de usuario' })
	username: string;

	@Field(() => String, { description: 'Contraseña de usuario', nullable: true })
	@Prop({ type: String, required: true })
	password: string;

	@Field(() => Role, {
		description: 'Rol que ocupa el usuario',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Role.name,
		autopopulate: true,
		required: true,
	})
	role: Types.ObjectId;

	@Field(() => CustomerType, {
		description: 'Tipo de cliente',
		nullable: true,
	})
	@Prop({ type: Types.ObjectId, ref: 'CustomerType' })
	customerType: Types.ObjectId;

	@Field(() => Shop, {
		description: 'Tienda a la que se encuentra asiganado el usuario',
	})
	@Prop({
		type: Types.ObjectId,
		ref: 'Shop',
		autopopulate: true,
		required: true,
	})
	shop: Types.ObjectId;

	@Prop({
		type: Types.ObjectId,
		ref: 'PointOfSale',
		autopopulate: true,
	})
	@Field(() => PointOfSale, {
		description: 'Punto de venta asignado al usuario',
		nullable: true,
	})
	pointOfSale: Types.ObjectId;

	@Prop({
		type: Types.ObjectId,
		ref: 'Company',
		autopopulate: true,
		required: true,
	})
	@Field(() => Company, {
		description: 'Empresa a la que pertenece el usuario',
	})
	company: Types.ObjectId;

	@Prop({ type: String })
	@Field(() => String, {
		description: 'Estado del usuario (active, inactive, suspend)',
	})
	status: string;

	@Field(() => User, {
		description: 'Usuario que creó el usuario',
		nullable: true,
	})
	@Prop({ type: Object })
	user: Partial<User>;

	@Field(() => Date, { description: 'Nombre de usuario' })
	createdAt: Date;

	@Field(() => Date, { description: 'Nombre de usuario' })
	updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Entity({ name: 'users' })
@ObjectType()
export class UserMysql {
	@Field()
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column({ type: 'int' })
	role_id: number;

	@Field()
	@Column({ type: 'varchar' })
	authentication_token: string;

	@Field()
	@Column({ type: 'int' })
	shop_id: number;

	@Field()
	@Column({ type: 'int' })
	customer_id: number;

	@Field()
	@Column({ type: 'int' })
	owner_user_id: number;

	@Field()
	@Column({ type: 'varchar' })
	user: string;

	@Field()
	@Column({ type: 'varchar' })
	email: string;

	@Field()
	@Column({ type: 'varchar' })
	password: string;

	@Field()
	@Column({ type: 'tinyint' })
	active: boolean;

	@Field()
	@Column({ type: 'datetime' })
	created_at: Date;

	@Field()
	@Column({ type: 'datetime' })
	last_login_at: Date;

	@Field()
	@Column({ type: 'varchar' })
	name: string;

	@Field()
	@Column({ type: 'varchar' })
	identification: string;

	@Field()
	@Column({ type: 'tinyint' })
	wholesale_member: boolean;
}

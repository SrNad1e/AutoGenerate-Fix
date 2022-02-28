import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Shop } from 'src/shops/entities/shop.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from './role.entity';

@Schema({ timestamps: true })
@ObjectType()
export class User extends mongoose.Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: string;

	@Prop({ type: String, required: true })
	@Field(() => String, {
		description: 'Nombre de la persona que usa el usuario',
	})
	name: string;

	@Prop({ type: String, required: true, trim: true })
	@Field(() => String, { description: 'Nombre de usuario' })
	username: string;

	@Field(() => String, { description: 'Contraseña de usuario', nullable: true })
	@Prop({ type: String, required: true })
	password: string;

	@Field(() => Role, {
		description: 'Rol que ocupa el usuario',
	})
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Role.name,
		autopopulate: true,
	})
	role: mongoose.Schema.Types.ObjectId;

	@Field(() => Shop, {
		description: 'Tienda a la que se encuentra asiganado el usuario',
	})
	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Shop',
		autopopulate: true,
	})
	shop: mongoose.Schema.Types.ObjectId;

	@Field(() => User, { description: 'Usuario que creó el usuario' })
	@Prop({ type: Object, required: true })
	user: Partial<User>;

	@Field(() => Date, { description: 'Nombre de usuario' })
	createdAt: Date;

	@Field(() => Date, { description: 'Nombre de usuario' })
	updateAt: Date;
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

import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Schema({ timestamps: true })
@ObjectType()
export class User {
	@Field({ description: 'id de mysql por migracion' })
	@Prop({ type: Number })
	id: number;

	@Field(() => String, { description: 'Identificador de mongo' })
	_id: string;

	@Field({ description: 'Nombre de la persona que usa el usuario' })
	@Prop({ type: String, required: true })
	name: string;

	@Field({ description: 'Nombre de usuario' })
	@Prop({ type: String, required: true })
	userName: string;

	@Field({ description: 'Contraseña de usuario' })
	@Prop({ type: String, select: false, required: true })
	password: string;

	@Field(() => User, { description: 'Usuario que creó el usuario' })
	@Prop({ type: Object, required: true })
	user: Partial<User>;

	@Field(() => Role, { description: 'Rol que ocupa el usuario' })
	@Prop({ type: Object, required: true })
	role: Role;

	@Field({ description: 'Nombre de usuario' })
	createdAt: Date;

	@Field({ description: 'Nombre de usuario' })
	updateAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Entity({ name: 'users' })
export class UserMysql {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int' })
	role_id: number;

	@Column({ type: 'varchar' })
	authentication_token: string;

	@Column({ type: 'int' })
	shop_id: number;

	@Column({ type: 'int' })
	customer_id: number;

	@Column({ type: 'int' })
	owner_user_id: number;

	@Column({ type: 'varchar' })
	user: string;

	@Column({ type: 'varchar' })
	email: string;

	@Column({ type: 'varchar' })
	password: string;

	@Column({ type: 'tinyint' })
	active: boolean;

	@Column({ type: 'datetime' })
	created_at: Date;

	@Column({ type: 'datetime' })
	last_login_at: Date;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar' })
	identification: string;

	@Column({ type: 'tinyint' })
	wholesale_member: boolean;
}

import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { Role } from './role.entity';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';
import { Company } from 'src/configurations/entities/company.entity';
import { Customer } from 'src/crm/entities/customer.entity';
import { Shop } from './shop.entity';

export enum StatusUser {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPEND = 'suspend',
}

registerEnumType(StatusUser, { name: 'StatusUser' });

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

	@Prop({ type: String, required: true, trim: true, lowercase: true })
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

	@Field(() => Shop, {
		description: 'Tienda a la que se encuentra asignado el usuario',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Shop.name,
		autopopulate: true,
		required: true,
	})
	shop: Types.ObjectId;

	@Field(() => Customer, { description: 'Cliente asignado', nullable: true })
	@Prop({ type: Types.ObjectId, ref: Customer.name })
	customer: Types.ObjectId;

	@Prop({
		type: Types.ObjectId,
		ref: PointOfSale.name,
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
		description: 'Compañía de acceso para el usuario',
	})
	company: Types.ObjectId;

	@Prop({ type: String, default: 'active' })
	@Field(() => StatusUser, {
		description: 'Estado del usuario',
	})
	status: StatusUser;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Usado para diferenciar la creación de los usuarios',
	})
	isWeb: boolean;

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

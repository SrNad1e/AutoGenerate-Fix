/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { City } from './city.entity';
import { CustomerType } from './customerType.entity';
import { DocumentType } from './documentType.entity';

@ObjectType()
export class Address {
	@Field(() => String, {
		description: 'Tipo de ubicación (Calle, Avenida, Manzana, Etc)',
	})
	field1: string;

	@Field(() => Number, {
		description: 'Número del field1',
	})
	number1: number;

	@Field(() => String, {
		description: 'Tipo de ubicación (Calle, Avenida, Manzana, Etc)',
	})
	field2: string;

	@Field(() => Number, {
		description: 'Número del field2',
	})
	number2: number;

	@Field(() => Number, {
		description: 'Número de la casa',
	})
	loteNumber: number;

	@Field(() => String, {
		description: 'Datos extra de la dirección',
		nullable: true,
	})
	extra: string;

	@Field(() => City, { description: 'Ciudad a la que pertenece' })
	city: City;

	@Field(() => Boolean, {
		description: 'Define si la dirección es la principal',
	})
	isMain: boolean;
}

@Schema({ timestamps: true })
@ObjectType()
export class Customer extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => DocumentType, { description: 'Tipo de documento' })
	@Prop({ type: String, required: true })
	documentType: DocumentType;

	@Field(() => String, { description: 'Número de documento' })
	@Prop({ type: String, required: true })
	document: string;

	@Field(() => String, { description: 'Nombres del cliente' })
	@Prop({ type: String, required: true })
	firstName: string;

	@Field(() => String, { description: 'Apellidos del cliente' })
	@Prop({ type: String, required: true })
	lastName: string;

	@Field(() => CustomerType, {
		description: 'Tipo de cliente',
	})
	@Prop({ type: Types.ObjectId, ref: 'CustomerType' })
	type: Types.ObjectId;

	@Field(() => [Address], {
		description: 'Direcciones del cliente',
		nullable: true,
	})
	@Prop({ type: Array })
	address: Address[];

	@Field(() => Number, {
		description: 'Número telefonico del cliente',
		nullable: true,
	})
	@Prop({ type: Number })
	phone: number;

	@Field(() => Boolean, {
		description: 'Número telefonico tiene whatsapp',
	})
	@Prop({ type: Boolean, default: false })
	isWhatsapp: boolean;

	@Field(() => String, {
		description: 'Número telefonico tiene whatsapp',
		nullable: true,
	})
	@Prop({ type: String })
	email: string;

	@Field(() => Boolean, {
		description: 'Cliente por defecto',
	})
	@Prop({ type: Boolean, default: false })
	isDefault: boolean;

	@Field(() => Boolean, {
		description: 'Se encuentra activo el usuario',
	})
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => User, {
		description: 'Usuario que creó o editó el cliente',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => User, {
		description: 'Usuario asigando al cliente',
		nullable: true,
	})
	@Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
	assigningUser: Types.ObjectId;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

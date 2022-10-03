import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

import { City } from './city.entity';
import { CustomerType } from './customerType.entity';
import { DocumentType } from './documentType.entity';

@ObjectType({ description: 'Dirección del cliente' })
export class Address {
	@Field(() => String, {
		description: 'Tipo de ubicación (Calle, Avenida, Manzana, Etc)',
	})
	field1: string;

	@Field(() => String, {
		description: 'Número del field1',
	})
	number1: string;

	@Field(() => String, {
		description: 'Número del field2',
	})
	number2: string;

	@Field(() => String, {
		description: 'Número de la casa',
	})
	loteNumber: string;

	@Field(() => String, {
		description: 'Datos extra de la dirección',
		nullable: true,
	})
	extra?: string;

	@Field(() => String, {
		description: 'Barrio',
	})
	neighborhood: string;

	@Field(() => City, { description: 'Ciudad a la que pertenece' })
	city: City;

	@Field(() => String, { description: 'Contacto para el envío' })
	@Prop({ type: String })
	contact: string;

	@Field(() => String, { description: 'Teléfono del contacto' })
	@Prop({ type: String })
	phone: string;

	@Field(() => Boolean, {
		description: 'Define si la dirección es la principal',
		nullable: true,
	})
	isMain: boolean;

	@Field(() => String, { description: 'Código postal', nullable: true })
	postalCode?: string;
}

@Schema({ timestamps: true })
@ObjectType({ description: 'Cliente' })
export class Customer extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => DocumentType, { description: 'Tipo de documento' })
	@Prop({ type: Types.ObjectId, ref: DocumentType.name, required: true })
	documentType: Types.ObjectId;

	@Field(() => String, { description: 'Número de documento' })
	@Prop({ type: String, unique: true })
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
	@Prop({ type: Types.ObjectId, ref: CustomerType.name })
	customerType: Types.ObjectId;

	@Field(() => [Address], {
		description: 'Direcciones del cliente',
		nullable: true,
	})
	@Prop({ type: Array, default: [] })
	addresses: Address[];

	@Field(() => String, {
		description: 'Número telefónico del cliente',
		nullable: true,
	})
	@Prop({ type: String })
	phone: string;

	@Field(() => Boolean, {
		description: 'Número telefonico tiene whatsapp',
	})
	@Prop({ type: Boolean, default: false })
	isWhatsapp: boolean;

	@Field(() => String, {
		description: 'Número telefónico tiene whatsapp',
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

	@Field(() => Date, {
		description: 'Fecha de nacimiento',
		nullable: true,
	})
	@Prop({ type: Date })
	birthday: Date;

	@Field(() => User, {
		description: 'Usuario que creó o editó el cliente',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

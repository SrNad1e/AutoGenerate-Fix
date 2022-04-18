import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Company extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Nombre de la compañía' })
	name: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Documento de la compañía' })
	document: string;

	@Prop({ type: Boolean, default: false })
	@Field(() => Boolean, {
		description: 'Si pertenece al régimen simplificado',
	})
	regimenSimplify: boolean;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Dirección de la compañía' })
	address: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Teléfono de la compañía' })
	phone: string;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Url del logo de la compañía' })
	logo: string;

	@Prop({ type: Boolean, default: true })
	@Field(() => Boolean, { description: 'Esta activa la compañía' })
	active: boolean;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la compañia' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la compañia' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la compañia',
	})
	updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

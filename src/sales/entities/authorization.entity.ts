import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';

@Schema({ timestamps: true, collection: 'authorizationDIAN' })
@ObjectType({ description: 'Autorizacion DIAN de la tienda' })
export class AuthorizationDian extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Prefijo de autorización' })
	@Prop({ type: String, required: true })
	prefix: string;

	@Field(() => String, {
		description: 'Resolución de la autorización o de la habilitación',
		nullable: true,
	})
	@Prop({ type: String })
	resolution?: string;

	@Field(() => Boolean, { description: 'Si es una habilitación true' })
	@Prop({ type: Boolean, default: false })
	qualification: boolean;

	@Field(() => String, {
		description: 'Compañía a la que pertenece la autorización',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Prop({ type: Date })
	@Field(() => Date, {
		description: 'Fecha de inicio de la resolución',
		nullable: true,
	})
	dateInitial?: Date;

	@Prop({ type: Date })
	@Field(() => Date, {
		description: 'Fecha de finalización de la resolución',
		nullable: true,
	})
	dateFinal?: Date;

	@Prop({ type: Number })
	@Field(() => Number, {
		description: 'Numero inicial de la resolución',
		nullable: true,
	})
	numberInitial?: number;

	@Prop({ type: Number })
	@Field(() => Number, {
		description: 'Numero final de la resolución',
		nullable: true,
	})
	numberFinal?: number;

	@Prop({ type: Number, default: 0 })
	@Field(() => Number, {
		description: 'Ultimo numero usado para facturar',
	})
	lastNumber?: number;

	@Prop({ type: Date })
	@Field(() => Date, {
		description: 'Última fecha de facturación',
		nullable: true,
	})
	lastDateInvoicing?: Date;

	@Field(() => User, {
		description: 'Usuario que creó o editó la autorización de facturación',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const AuthorizationDianSchema =
	SchemaFactory.createForClass(AuthorizationDian);

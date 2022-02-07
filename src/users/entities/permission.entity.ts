/* eslint-disable prettier/prettier */
import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

@Schema()
@ObjectType()
export class Permission {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field({ description: 'módulo al que perteneces el permiso' })
	@Prop({ type: String, required: true })
	module: string;

	@Field({ description: 'Título de la acción' })
	@Prop({ type: String, required: true })
	title: string;

	@Field({ description: 'Nombre de la acción' })
	@Prop({ type: String, required: true })
	name: string;

	@Field({ description: 'Detalle de la acción' })
	@Prop({ type: String, required: true })
	description: string;

	@Field({ description: 'Tipo de acción crud que genera acceso' })
	@Prop({ type: String, required: true })
	action: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

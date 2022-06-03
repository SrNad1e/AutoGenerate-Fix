import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { Permissions } from '../libs/permissions.decorator';

@Schema()
@ObjectType({ description: 'Permisos a los que tiene el usuario' })
export class Permission {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field({ description: 'Módulo al que pertenece el permiso' })
	@Prop({ type: String, required: true })
	module: string;

	@Field({ description: 'Opción del módulo al que pertenece el permiso' })
	@Prop({ type: String, required: true })
	option: string;

	@Field({ description: 'Nombre de la acción' })
	@Prop({ type: String, required: true })
	name: string;

	@Field({ description: 'Detalle de la acción' })
	@Prop({ type: String, required: true })
	description: string;

	@Field(() => Permissions, {
		description: `Tipo de acción`,
	})
	@Prop({ type: String, unique: true })
	action: Permissions;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

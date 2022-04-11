import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

@ObjectType()
@Schema()
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

	@Field({
		description: 'Tipo de acción (list, see, create, update, autogenerate)',
	})
	@Prop({ type: String, required: true })
	action: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

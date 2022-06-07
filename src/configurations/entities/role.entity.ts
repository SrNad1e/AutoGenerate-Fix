import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Permission } from './permission.entity';
import { User } from './user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Rol del usuario ' })
export class Role {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field({ description: 'Nombre asignado al rol' })
	@Prop({ type: String, unique: true })
	name: string;

	@Field(() => [Permission], {
		description: 'Permisos al los quie tiene el rol',
	})
	@Prop({ type: [Types.ObjectId], ref: Permission.name })
	permissions: Types.ObjectId[];

	@Field({ description: 'Permite hacer consultas con otra bodega' })
	@Prop({ type: Boolean, default: false })
	changeWarehouse: boolean;

	@Field(() => Boolean, { description: 'Se encuentra activo el rol' })
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Field(() => User, { description: 'Usuario que creó o modificó el rol' })
	@Prop({ type: Object, required: true })
	user: Partial<User>;

	@Field({ description: 'Fecha de creación del rol' })
	createdAt: Date;

	@Field({ description: 'Fecha en la que se actualizó el rol' })
	updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

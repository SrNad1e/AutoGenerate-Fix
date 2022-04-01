import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

import { Permission } from './permission.entity';
import { User } from './user.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Role {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field({ description: 'Nombre asiganado al rol' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => [Permission], {
		description: 'Permisos al los quie tiene el rol',
	})
	@Prop({ type: Array })
	permissions: Permission[];

	@Field(() => User, { description: 'Usuario que creó o modificó el rol' })
	@Prop({ type: Object, required: true })
	user: Partial<User>;

	@Field({ description: 'Fecha de creación del rol' })
	createdAt: Date;

	@Field({ description: 'Fecha en la que se actualizó el rol' })
	updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

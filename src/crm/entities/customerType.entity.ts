import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Tipos de clientes' })
export class CustomerType extends Document {
	@Field(() => String, { description: 'Identificación de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del tipo de cliente' })
	@Prop({ type: String })
	name: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó el tipo de cliente',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CustomerTypeSchema = SchemaFactory.createForClass(CustomerType);

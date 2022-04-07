import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Brand extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Prop({ type: String, required: true })
	@Field(() => String, { description: 'Nombre de la marca' })
	name: string;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la marca' })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación de la marca' })
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la marca',
	})
	updatedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

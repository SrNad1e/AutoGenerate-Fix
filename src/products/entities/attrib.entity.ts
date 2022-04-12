import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Attrib extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => String, { description: 'Nombre de la atributo' })
	@Prop({ type: String, required: true })
	name: string;

	@Prop({ type: Object, required: true })
	@Field(() => User, { description: 'Usuario que crea la atributo' })
	user: User;

	@Field(() => Date, {
		description: 'Fecha de creación de la atributo',
	})
	createdAt: Date;

	@Field(() => Date, {
		description: 'Fecha de actualización de la atributo',
	})
	updatedAt: Date;
}

export const AttribSchema = SchemaFactory.createForClass(Attrib);

import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType({ description: 'Indexación de las imagenes' })
@Schema({ timestamps: true })
export class Image {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => String, { description: 'Nombre de la imagen' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, {
		description: 'Key única con la que se guarda la imaen',
	})
	@Prop({ type: String, unique: true })
	key: string;

	@Field(() => String, { description: 'Dirección de la imagen' })
	@Prop({ type: String, unique: true })
	url: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó la imagen',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}
export const ImageSchema = SchemaFactory.createForClass(Image);

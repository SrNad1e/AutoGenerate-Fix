import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@ObjectType({ description: 'Enlaces de diferences tamaños' })
export class ImageTypes {
	@Field(() => String, { description: 'Enlace de imagen pequeña' })
	small: string;

	@Field(() => String, { description: 'Enlace de imagen mediana' })
	medium: string;

	@Field(() => String, { description: 'Enlace de imagen grande' })
	big: string;
}

@ObjectType({ description: 'Enlaces de diferences tipos' })
export class Urls {
	@Field(() => ImageTypes, { description: 'Enlaces de tipo webp' })
	webp: ImageTypes;

	@Field(() => ImageTypes, { description: 'Enlaces de tipo jpeg' })
	jpeg: ImageTypes;

	@Field(() => String, { description: 'Enlaces de tipo webp' })
	original: string;
}

@ObjectType({ description: 'Indexación de las imagenes' })
@Schema({ timestamps: true })
export class Image {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;

	@Field(() => String, { description: 'Nombre de la imagen' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => Urls, { description: 'Direcciones de la imagen' })
	@Prop({ type: Object, default: {} })
	urls: Urls;

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

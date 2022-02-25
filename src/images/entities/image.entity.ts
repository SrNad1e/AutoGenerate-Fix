import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class Image {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;
}

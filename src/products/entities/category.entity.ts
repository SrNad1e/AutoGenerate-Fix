/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Document, ObjectId } from 'mongoose';

@ObjectType()
export class Category extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: ObjectId;
}

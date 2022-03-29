import { Field, ObjectType } from '@nestjs/graphql';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'authorizationDIAN' })
@ObjectType()
export class AuthorizationDian extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Prefijo de autorización' })
	prefix: string;
}

export const AuthorizationDianSchema =
	SchemaFactory.createForClass(AuthorizationDian);

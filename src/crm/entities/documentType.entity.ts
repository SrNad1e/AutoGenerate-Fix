import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType()
export class DocumentType {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del tipo de documento' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => String, { description: 'Abreviación (CC, NIT, TI, CE, PASS)' })
	@Prop({ type: String, required: true })
	abbreviation: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó el pedido',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}
export const DocumentTypeSchema = SchemaFactory.createForClass(DocumentType);


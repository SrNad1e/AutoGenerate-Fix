import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { User } from 'src/configurations/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Caja donde se deposita el dinero' })
export class Box extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre de la caja' })
	@Prop({ type: String, required: true })
	name: string;

	@Field(() => Number, { description: 'Base de la caja' })
	@Prop({ type: Number, default: 0 })
	base: number;

	@Field(() => Number, {
		description: 'Total de dinero en la caja sin contar la base',
	})
	@Prop({ type: Number, default: 0 })
	total: number;

	@Field(() => Company, {
		description: 'Empresa a la que perteneces la caja',
	})
	@Prop({
		type: Types.ObjectId,
		ref: Company.name,
		autopopulate: true,
	})
	company: Types.ObjectId;

	@Field(() => Boolean, {
		description: 'Caja principal de la empresa',
	})
	@Prop({ type: Boolean, default: false })
	isMain: boolean;

	@Field(() => User, {
		description: 'Usuario que creó o editó la caja',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const BoxSchema = SchemaFactory.createForClass(Box);

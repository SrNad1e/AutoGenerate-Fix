import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType()
export class CustomerType extends Document {
	@Field(() => String, { description: 'Identificación de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, { description: 'Nombre del tipo de cliente' })
	@Prop({ type: String })
	name: string;

	@Field(() => Number, { description: 'Descuento al tipo de cliente' })
	@Prop({ type: Number, default: 0 })
	discount: number;

	@Field(() => User, {
		description: 'Usuario que creó o editó el tipo de cliente',
	})
	@Prop({ type: Object })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updateAt: Date;
}

export const CustomerTypeSchema = SchemaFactory.createForClass(CustomerType);

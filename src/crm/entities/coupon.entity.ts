import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { User } from 'src/configurations/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType({ description: 'Cupones para pagos' })
export class Coupon extends Document {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: Types.ObjectId;

	@Field(() => String, {
		description: 'Código para redención del cupón',
	})
	@Prop({ type: String, unique: true })
	code: string;

	@Field(() => Number, {
		description: 'Consecutivo del cupón',
	})
	@Prop({ type: Number, required: true })
	number: number;

	@Field(() => Company, {
		description: 'Consecutivo del cupón',
	})
	@Prop({ type: Types.ObjectId, required: true })
	company: Types.ObjectId;

	@Field(() => Number, {
		description: 'Valor de redención del cupón',
	})
	@Prop({ type: Number, required: true })
	value: number;

	@Field(() => Date, {
		description: 'Fecha de vencimiento del cupón',
	})
	@Prop({ type: Date })
	expiration: Date;

	@Field(() => String, {
		description: 'Título del cupón',
	})
	@Prop({ type: String, required: true })
	title: string;

	@Field(() => String, {
		description: 'Mensaje del pie del cupón',
	})
	@Prop({ type: String, required: true })
	message: string;

	@Field(() => User, {
		description: 'Usuario que creó o editó el cupón',
	})
	@Prop({ type: Object, required: true })
	user: User;

	@Field(() => Date, { description: 'Fecha de creación' })
	createdAt: Date;

	@Field(() => Date, { description: 'Fecha de actualización' })
	updatedAt: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

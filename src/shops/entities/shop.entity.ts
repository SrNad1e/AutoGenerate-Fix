/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserMysql } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Shop  extends Document{
	@Field()
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Field(() => UserMysql)
	@Prop({ type: Object })
	user: UserMysql;

	@Field()
	@Prop({ type: String, default: 'active' })
	status: string;

	@Field()
	@Prop({ type: String })
	address: string;

	@Field()
	@Prop({ type: String })
	phone: string;

	@Field()
	@Prop({ type: Number })
	goal: number;

	//TODO: se debe normalizar los ids de los modelos
	@Field()
	@Prop({ type: Number, unique: true })
	shopId?: number;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

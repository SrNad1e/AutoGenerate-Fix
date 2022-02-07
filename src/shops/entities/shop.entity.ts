/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserMysql } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
export class Shop {
	@Prop({ type: String, required: true, unique: true })
	name: string;

	@Prop({ type: Object })
	user: UserMysql;

	@Prop({ type: String, default: 'active' })
	status: string;

	@Prop({ type: String })
	address: string;

	@Prop({ type: String })
	phone: string;

	@Prop({ type: Number })
	goal: number;

	//TODO: se debe normalizar los ids de los modelos
	@Prop({ type: Number, unique: true })
	shopId?: number;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);

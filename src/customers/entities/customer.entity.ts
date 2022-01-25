/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
	@Prop({ type: Object, default: { active: false } })
	wholesale: {
		active: boolean;
		activatedAt: Date;
	};

	@Prop({ type: String, default: 'cc' })
	identificationType: string;

	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Prop({ type: Boolean, default: false })
	creditable: boolean;

	@Prop({ type: Number, default: 0 })
	creditTop: number;

	@Prop({ type: String, required: true })
	firstName: string;

	@Prop({ type: String, required: true })
	lastName: string;

	@Prop({ type: String, required: true })
	identification: string;
	@Prop({ type: String })
	phone: string;

	@Prop({ type: String })
	email: string;

	@Prop({ type: Date })
	birthDay: Date;

	@Prop({ type: Number, required: true })
	userId: number;

	@Prop({ type: Number, default: 1 })
	clasificationId: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

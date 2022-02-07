/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Customer } from 'src/customers/entities/customer.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Order } from 'src/invoices/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { UserMysql } from 'src/users/entities/user.entity';

@Schema({ timestamps: true })
export class Coupon extends Document {
	@Prop({ type: Boolean, default: true })
	active: boolean;

	@Prop({ type: String, default: 'pending' })
	status: string;

	@Prop({ type: Number, required: true })
	amount: number;

	@Prop({ type: Date, required: true })
	dueDate: Date;

	@Prop({ type: Object, required: true })
	shop: Shop;

	@Prop({ type: Object, required: true })
	user: UserMysql;

	@Prop({ type: Object, required: true })
	customer: Customer;

	@Prop({ type: Object, required: true })
	invoice: Invoice;

	@Prop({ type: Object, required: true })
	order: Order;

	@Prop({ type: String, required: true, unique: true })
	couponCode: string;

	@Prop({ type: Number, required: true, unique: true, default: 0 })
	number: number;

	@Prop({ type: Object, default: {} })
	redeemOrder: Order;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

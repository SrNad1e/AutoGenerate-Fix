/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Order } from 'src/invoices/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Invoice } from './invoice.entity';

@Schema()
export class Refund extends Document {
	@Prop({ type: Object, required: true })
	order: Order;

	@Prop({ type: Object, required: true })
	invoice: Invoice;

	@Prop({ type: Array, required: true })
	products: Product[];

	@Prop({ type: Object, required: true })
	user: User;

	@Prop({ type: Object, required: true, index: true })
	shop: Shop;

	@Prop({ type: Number, required: true })
	amount: number;

	@Prop({ type: Number, required: true, index: true, unique: true })
	code: number;
}

export const RefundSchema = SchemaFactory.createForClass(Refund);

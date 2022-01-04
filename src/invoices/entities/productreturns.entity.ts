import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Invoice } from './invoice.entity';

//TODO: entity pendiente a cambiar por nombre más simple

@Schema()
export class ProductReturns extends Document {
	@Prop()
	order: Order;

	@Prop()
	invoice: Invoice;

	@Prop({ type: Array, required: true })
	products: Product[];

	@Prop({ type: Object, required: true })
	user: User;

	@Prop({ type: Object, required: true })
	shop: Shop;

	@Prop({ type: Number, required: true })
	amount: number;

	@Prop({ type: Number, required: true })
	code: number;

	@Prop()
	coupon: Coupon;
}

export const ProductReturnsSchema =
	SchemaFactory.createForClass(ProductReturns);

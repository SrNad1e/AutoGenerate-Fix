/* eslint-disable prettier/prettier */
import { Prop, Schema } from '@nestjs/mongoose';

import { Status } from 'src/configurations/entities/status.entity';
import { StatusHistory } from 'src/configurations/entities/statusHistory.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { DeliveryAddress } from 'src/customers/entities/deliveryaddress.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { UserMysql } from 'src/users/entities/user.entity';
import { Summary } from './summary.entity';

@Schema({ timestamps: true })
export class Invoice {
	@Prop({ type: Object })
	shipping: Shipping;

	@Prop({ type: Object })
	deliveryAddress: DeliveryAddress;

	@Prop({ type: Object, required: true })
	summary: Summary;

	@Prop({ type: String, required: true })
	orderType: string;

	@Prop({ type: String, required: true })
	paymentStatus: string;

	@Prop({ type: Array })
	shippingCheckedErrorLog: string[];

	@Prop({ type: String })
	cartId: string;

	@Prop({ type: Object, required: true })
	seller: UserMysql;

	@Prop({ type: Object, required: true })
	user: UserMysql;

	@Prop({ type: Object, required: true })
	shop: Shop;

	@Prop({ type: Object, required: true })
	warehouse: Warehouse;

	@Prop({ type: Array, required: true })
	products: Product[];

	@Prop({ type: Array, required: true })
	payments: Payment[];

	@Prop({ type: Object, required: true })
	customer: Customer;

	@Prop({ type: Object, required: true })
	status: Status;

	@Prop({ type: Array, default: [] })
	statusHistory: StatusHistory[];

	@Prop({ type: Array })
	comments: string[];

	@Prop({ type: Number, required: true })
	code: number;
}

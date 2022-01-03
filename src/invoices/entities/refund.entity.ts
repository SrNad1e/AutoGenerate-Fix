import { Coupon } from 'src/coupons/entities/coupon.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Invoice } from './invoice.entity';

export class Refund {
	_id: string;
	order: Order;
	invoice: Invoice;
	products: Product[];
	user: User;
	shop: Shop;
	amount: number;
	createdAt: string;
	updatedAt: string;
	code: number;
	__v: number;
	coupon: Coupon;
}

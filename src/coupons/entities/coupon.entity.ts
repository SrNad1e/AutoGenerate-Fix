import { Customer } from 'src/customers/entities/customer.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';

export class Coupon {
	_id: string;
	active: boolean;
	status: string;
	amount: number;
	dueDate: string;
	shop: Shop;
	user: User;
	customer: Customer;
	invoice: Invoice;
	order: Order;
	createdAt: string;
	updatedAt: string;
	__v: number;
	couponCode: string;
	number: number;
	redeemOrder: Order;
}

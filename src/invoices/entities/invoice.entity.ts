import { Status } from 'src/configs/entities/status.entity';
import { StatusHistory } from 'src/configs/entities/statusHistory.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { DeliveryAddress } from 'src/customers/entities/deliveryaddress.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { Payment } from 'src/treasury/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Summary } from './summary.entity';

export class Invoice {
	_id: string;
	shipping: Shipping;
	deliveryAddress: DeliveryAddress;
	summary: Summary;
	orderType: string;
	paymentStatus: string;
	shippingCheckedErrorLog: any[];
	cartId: string;
	user_id: number;
	seller: User;
	user: User;
	shopId: number;
	shop: Shop;
	warehouseId: number;
	warehouse: Warehouse;
	products: Product[];
	payments: Payment[];
	customer: Customer;
	status: Status;
	statusHistory: StatusHistory[];
	comments: any[];
	createdAt: string;
	updatedAt: string;
	code: number;
}

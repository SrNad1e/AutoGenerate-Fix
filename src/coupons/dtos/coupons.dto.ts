/* eslint-disable prettier/prettier */
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

import { Customer } from 'src/customers/entities/customer.entity';
import { Invoice } from 'src/invoices/entities/invoice.entity';
import { Refund } from 'src/invoices/entities/refund.entity';
import { Order } from 'src/invoices/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { UserMysql } from 'src/users/entities/user.entity';

export class CouponsSortDto {
	@IsOptional()
	order?: Order;

	@IsOptional()
	shop?: Shop;
}

export class CreateCouponsDto {
	@IsOptional()
	@IsPositive()
	amount: number;

	@IsOptional()
	shop: Shop;

	@IsOptional()
	user: UserMysql;

	@IsOptional()
	customer: Customer;

	@IsOptional()
	invoice: Invoice;

	@IsOptional()
	order: Order;

	@IsOptional()
	refund: Refund;
}

export class FilterCouponsDto {
	@IsOptional()
	@IsPositive()
	limit?: number;

	@IsOptional()
	@Min(0)
	page?: number;

	@IsOptional()
	@Min(0)
	orderCode?: number;

	@IsOptional()
	@Min(0)
	invoiceNumber?: number;

	@IsOptional()
	@Min(0)
	shopId?: number;

	@IsOptional()
	@IsString()
	couponCode?: string;

	@IsOptional()
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;
}

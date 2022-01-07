import {
	IsArray,
	IsObject,
	IsOptional,
	IsPositive,
	IsString,
	Min,
} from 'class-validator';
import { Customer } from 'src/customers/entities/customer.entity';
import { Order } from 'src/invoices/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Invoice } from '../entities/invoice.entity';
import { Refund } from '../entities/refund.entity';

export class RefundsSortDto {
	@IsOptional()
	order?: Order;

	@IsOptional()
	invoice?: Invoice;

	@IsOptional()
	shop?: Shop;
}

export class CreateRefundsDto {
	@IsString()
	orderId: string;

	@IsArray()
	products: Product[];

	@IsObject()
	user: User;
}

export class FiltersRefundsDto {
	@IsOptional()
	@IsPositive()
	limit?: number;

	@IsOptional()
	@Min(0)
	skip?: number;

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
	sort?: RefundsSortDto;
}

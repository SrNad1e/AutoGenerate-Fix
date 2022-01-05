import { IsOptional, IsPositive, Min } from 'class-validator';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Invoice } from '../entities/invoice.entity';

export class RefundsSortDto {
	@IsOptional()
	order?: Order;

	@IsOptional()
	invoice?: Invoice;

	@IsOptional()
	shop?: Shop;
}

export class CreateRefundsDto {
	@IsOptional()
	invoice: Invoice;
	@IsOptional()
	order: Order;
	@IsOptional()
	products: Product[];
	@IsOptional()
	user: User;
	@IsOptional()
	shop: Shop;
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

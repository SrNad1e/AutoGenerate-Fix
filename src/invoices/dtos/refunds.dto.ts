/* eslint-disable prettier/prettier */
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';
import { ProductOrder } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateRefundsDto {
	@IsString()
	orderId: string;

	@IsArray()
	products: ProductOrder[];

	@IsObject()
	user: User;
}

export class FiltersRefundsDto {
	@IsOptional()
	limit?: number;

	@IsOptional()
	skip?: number;

	@IsOptional()
	orderCode?: number;

	@IsOptional()
	invoiceNumber?: number;

	@IsOptional()
	shopId?: number;

	@IsOptional()
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;
}

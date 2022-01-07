import {
	IsArray,
	IsObject,
	IsOptional,
	IsPositive,
	IsString,
	Min,
} from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

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

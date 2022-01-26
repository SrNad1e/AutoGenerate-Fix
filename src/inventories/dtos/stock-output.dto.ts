/* eslint-disable prettier/prettier */
import { IsOptional } from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

export class FiltersStockOutputDto {
	@IsOptional()
	limit?: number;

	@IsOptional()
	skip?: number;

	@IsOptional()
	number?: number;

	@IsOptional()
	warehouseId?: number;

	@IsOptional()
	status?: string;

	@IsOptional()
	createdAtMin?: Date;

	@IsOptional()
	createdAtMax?: Date;

	@IsOptional()
	productId: string;

	@IsOptional()
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;
}

export class CreateStockOutputParamsDto {
	products: {
		product_id: number;
		quantity: number;
	}[];
	warehouse: Warehouse;
	observation: string;
	status: string;
	user: User;
}

export class CreateStockOutputDto {
	detail: {
		product: Product;
		quantity: number;
		createdAt: Date;
		updateAt: Date;
	}[];

	status?: string;

	total: number;

	quantity: number;

	warehouse: Warehouse;

	observation?: string;

	user: User;
}

export class UpdateStockOutputParamsDto {
	products: {
		product_id: number;
		quantity: number;
	}[];

	status?: string;

	warehouse?: Warehouse;

	observation?: string;

	user: User;
}

/* eslint-disable prettier/prettier */
import {
	IsArray,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';
import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

export class FiltersStockAdjustmentDto {
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
	productId?: string;

	@IsOptional()
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;
}

export class CreateStockAdjustmentParamsDto {
	@IsArray()
	products: {
		product_id: number;
		quantity: number;
	}[];

	@IsObject()
	warehouse: Warehouse;

	@IsString()
	observation: string;

	@IsString()
	status: string;

	@IsObject()
	user: User;
}

export class CreateStockAdjustmentDto {
	@IsArray()
	detail: {
		product: Product;
		quantity: number;
		createdAt: Date;
		updateAt: Date;
	}[];

	@IsString()
	@IsOptional()
	status?: string;

	@IsNumber()
	total: number;

	@IsNumber()
	quantity: number;

	@IsObject()
	warehouse: Warehouse;

	@IsString()
	@IsOptional()
	observation?: string;

	@IsObject()
	user: User;
}

export class UpdateStockAdjustmentParamsDto {
	@IsArray()
	products: {
		product_id: number;
		quantity: number;
	}[];

	@IsString()
	@IsOptional()
	status?: string;

	@IsObject()
	@IsOptional()
	warehouse?: Warehouse;

	@IsString()
	@IsOptional()
	observation?: string;

	@IsObject()
	user: User;
}

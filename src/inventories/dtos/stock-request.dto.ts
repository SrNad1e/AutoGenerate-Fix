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

export class FiltersStockRequestDto {
	@IsOptional()
	limit?: number;

	@IsOptional()
	skip?: number;

	@IsOptional()
	warehouseDestinationId?: number;

	@IsOptional()
	warehouseOriginId?: number;

	@IsOptional()
	number?: number;

	@IsOptional()
	shopId?: number;

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

export class CreateStockRequestDto {
	@IsObject()
	detail: {
		product: Product;
		quantity: number;
		quantityConfirmed?: number;
		status: string;
		observation?: string;
		createdAt: Date;
		updateAt: Date;
	}[];

	@IsOptional()
	number?: number;

	@IsOptional()
	status?: string;

	@IsOptional()
	observationDestination?: string;

	@IsOptional()
	observation?: string;

	@IsNumber()
	warehouseOrigin: Warehouse;

	@IsNumber()
	warehouseDestination: Warehouse;

	@IsNumber()
	@IsOptional()
	userIdDestination: number;

	@IsOptional()
	code?: string;

	@IsOptional()
	createdAt?: Date;
}

export class UpdateStockRequestDto {
	@IsObject()
	@IsOptional()
	detail?: {
		product: Product;
		quantity: number;
		quantityConfirmed?: number;
		status: string;
		observation?: string;
		createdAt: Date;
		updateAt: Date;
	}[];

	@IsOptional()
	number?: number;

	@IsOptional()
	status?: string;

	@IsOptional()
	observationDestination?: string;

	@IsOptional()
	observation?: string;

	@IsNumber()
	warehouseOrigin?: Warehouse;

	@IsNumber()
	warehouseDestination?: Warehouse;

	@IsNumber()
	@IsOptional()
	userIdDestination?: number;

	@IsOptional()
	code?: string;

	@IsOptional()
	createdAt?: Date;
}

export class CreateStockRequestParamsDto {
	@IsArray()
	products: {
		product_id: number;
		quantity: number;
	}[];

	@IsOptional()
	observationDestination?: string;

	@IsNumber()
	warehouseOriginId: number;

	@IsNumber()
	warehouseDestinationId: number;

	@IsString()
	@IsOptional()
	status?: string;
	//TODO: Temporal mientras se traslada la autenticación
	@IsObject()
	user: User;
}

export class UpdateStockRequestParamsDto {
	@IsString()
	status: string;

	@IsString()
	@IsOptional()
	observationDestination?: string;

	@IsString()
	@IsOptional()
	observation?: string;

	@IsArray()
	products: {
		product_id: number;
		quantity: number;
	}[];

	@IsObject()
	user: User;
}

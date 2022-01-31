/* eslint-disable prettier/prettier */
import {
	IsArray,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { User } from 'src/users/entities/user.entity';

export class FiltersStockTransferDto {
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
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;
}

export class CreateStockTransferParamsDto {
	@IsArray()
	products: {
		product_id: number;
		quantity: number;
	}[];

	@IsArray()
	requests?: ObjectId[];

	@IsOptional()
	observationOrigin?: string;

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

export class UpdateStockTransferParamsDto {
	@IsString()
	status: string;

	@IsString()
	@IsOptional()
	observationDestination?: string;

	@IsString()
	@IsOptional()
	observationOrigin?: string;

	@IsArray()
	requests: ObjectId[];

	@IsString()
	@IsOptional()
	observation;

	@IsArray()
	products: {
		product_id: number;
		quantity: number;
	}[];
	@IsObject()
	user: User;
}

export class CreateStockTransferDto {
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

	@IsArray()
	requests: ObjectId[];

	@IsOptional()
	observationOrigin?: string;

	@IsOptional()
	observationDestination?: string;

	@IsOptional()
	observation?: string;

	@IsNumber()
	warehouseOrigin: Warehouse;

	@IsNumber()
	warehouseDestination: Warehouse;

	@IsNumber()
	userIdOrigin: number;

	@IsNumber()
	@IsOptional()
	userIdDestination?: number;

	@IsOptional()
	code?: string;

	@IsOptional()
	createdAt?: Date;
}

export class ConfirmDetailTransferDto {
	@IsNumber()
	quantityConfirmed: number;

	@IsString()
	@IsOptional()
	observation?: string;
}

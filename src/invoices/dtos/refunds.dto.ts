/* eslint-disable prettier/prettier */
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

import { UserMysql } from 'src/users/entities/user.entity';

export class CreateRefundsDto {
	@IsString()
	orderId: string;

	@IsArray()
	products: any[];

	@IsObject()
	user: UserMysql;
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

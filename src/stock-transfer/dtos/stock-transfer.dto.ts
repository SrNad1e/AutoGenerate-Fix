/* eslint-disable prettier/prettier */
import { IsOptional } from 'class-validator';

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

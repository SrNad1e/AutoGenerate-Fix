/* eslint-disable prettier/prettier */
import { IsObject, IsOptional, IsString } from 'class-validator';
import { UserMysql } from 'src/users/entities/user.entity';

export class FilterShopsDto {
	@IsOptional()
	limit?: number;

	@IsOptional()
	page?: number;

	@IsOptional()
	name?: string;

	@IsOptional()
	status?: string;

	@IsOptional()
	id?: number;

	@IsOptional()
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;
}

export class CreateShopParamsDto {
	@IsString()
	name: string;

	@IsString()
	address: string;

	@IsString()
	phone: string;

	@IsString()
	status: string;

	//TODO: eliminar al agregar validación
	@IsObject()
	user: UserMysql;

	@IsOptional()
	goal?: number;
}

export class UpdateShopParamsDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	address?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsOptional()
	goal?: number;

	//TODO: eliminar al agregar validación
	@IsObject()
	user: UserMysql;
}

/* eslint-disable prettier/prettier */
import { IsArray, IsObject, IsString } from 'class-validator';

export class AddConfigurationsParamsDto {
	@IsString()
	name: string;

	@IsArray()
	data: any[];
}

export class AddConfigurationsDto {
	@IsString()
	module: string;

	@IsObject()
	config: {
		name: string;
		data: any[];
		createdAt: Date;
		updatedAt: Date;
	};
}

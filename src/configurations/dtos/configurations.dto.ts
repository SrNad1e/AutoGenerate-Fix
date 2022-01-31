/* eslint-disable prettier/prettier */
import { IsArray, IsObject, IsString } from 'class-validator';

export class AddConfigurationsParamsDto {
	@IsString()
	name: string;

	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsArray()
	data: any[];
}

export class AddConfigurationsDto {
	@IsString()
	module: string;

	@IsObject()
	config: {
		name: string;
		title: string;
		description: string;
		data: any[];
		createdAt: Date;
		updatedAt: Date;
	};
}

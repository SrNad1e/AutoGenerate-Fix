/* eslint-disable prettier/prettier */
import { IsArray, IsString } from 'class-validator';

export class AddConfigurationsDto {
	@IsString()
	readonly name: string;

	@IsString()
	readonly title: string;

	@IsString()
	readonly description: string;

	@IsArray()
	readonly data: any[];
}

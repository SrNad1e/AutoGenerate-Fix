/* eslint-disable prettier/prettier */
import { InputType, Field } from '@nestjs/graphql';
import { IsArray, IsNotEmpty } from 'class-validator';

@InputType()
export class AddConfigInput {
	@Field()
	@IsNotEmpty()
	module: string;

	@Field()
	@IsNotEmpty()
	name: string;

	@Field()
	@IsNotEmpty()
	title: string;

	@Field()
	@IsNotEmpty()
	description: string;

	@Field(() => [DataInput])
	@IsNotEmpty()
	@IsArray()
	data: DataInput[];
}

@InputType()
export class DataInput {
	@Field()
	type: string;

	@Field()
	name: string;

	@Field(() => String || Number)
	value: string | number;
}

/* eslint-disable prettier/prettier */
import { Field, ObjectType } from '@nestjs/graphql';
import { Shop } from 'src/shops/entities/shop.entity';

@ObjectType()
export class ReportSalesResponse {
	@Field(() => Shop)
	shop: Shop;

	@Field(() => [Number])
	weeks: number[];
}

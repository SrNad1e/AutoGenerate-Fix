/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateCouponsDto, FilterCouponsDto } from '../dtos/coupons.dto';
import { CouponsService } from '../services/coupons.service';
@ApiTags('Cupones')
@Controller('coupons')
export class CouponsController {
	constructor(private couponsService: CouponsService) {}

	@Get()
	getAll(@Query() params: FilterCouponsDto) {
		return this.couponsService.getAll(params);
	}

	@Post()
	create(@Body() params: CreateCouponsDto) {
		return this.couponsService.create(params);
	}
}

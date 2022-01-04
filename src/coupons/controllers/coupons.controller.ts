import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Cupones')
@Controller('coupons')
export class CouponsController {
	@Get()
	getAll(@Query() query: any) {
		const { limit = 20, skip = 0 } = query;
		return `Estos son los datos de limit ${limit} y  skip ${skip}`;
	}

	@Get('/:id')
	getOne(@Param('id') id: string) {
		return `Este es tu id ${id}`;
	}
}

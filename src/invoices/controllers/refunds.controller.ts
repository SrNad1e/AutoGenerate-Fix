import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseIntPipe } from 'src/common/parse-int-pipe.pipe';
import { RefundsService } from '../services/refunds.service';

@ApiTags('Devoluciones')
@Controller('refunds')
export class RefundsController {
	constructor(private refundsService: RefundsService) {}

	@Get()
	getAll(
		@Query('limit', ParseIntPipe) limit,
		@Query('skip', ParseIntPipe) skip,
		@Query('order.code', ParseIntPipe) code,
		@Query('invoice.number', ParseIntPipe) number,
		@Query('shop.shopId', ParseIntPipe) shopId,
	) {
		return this.refundsService.getAll({ limit, skip, code, number, shopId });
	}

	@Get('/:id')
	getOne(@Param('id') id: string) {
		return `Este es tu id ${id}`;
	}

	@Post()
	create(@Body() body: any) {
		return {
			message: 'Devolución creada correctamente',
		};
	}
}

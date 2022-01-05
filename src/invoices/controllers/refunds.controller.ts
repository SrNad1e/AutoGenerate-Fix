import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRefundsDto, FiltersRefundsDto } from '../dtos/refunds.dto';
import { RefundsService } from '../services/refunds.service';

@ApiTags('Devoluciones')
@Controller('refunds')
export class RefundsController {
	constructor(private refundsService: RefundsService) {}

	@Get()
	getAll(@Query() params: FiltersRefundsDto) {
		return this.refundsService.getAll(params);
	}

	@Post()
	async create(@Body() params: CreateRefundsDto) {

		return this.refundsService.create(params);
	}
}

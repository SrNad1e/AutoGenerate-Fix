/* eslint-disable prettier/prettier */
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
	CreateStockRequestParamsDto,
	FiltersStockRequestDto,
	UpdateStockRequestParamsDto,
} from '../dtos/stock-request.dto';
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import { StockRequestService } from '../services/stock-request.service';

@ApiTags('Solicitudes de Mercancía')
@Controller('stock-request')
export class StockRequestController {
	constructor(private stockRequestService: StockRequestService) {}
	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query() params: FiltersStockRequestDto,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
	) {
		return this.stockRequestService.getAll({
			...params,
			sort,
		});
	}
	@Get('migrate')
	@UsePipes(new ValidationPipe({ transform: true }))
	showMigrate() {
		return this.stockRequestService.migrate();
	}

	@Get(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	getById(@Param('id') id: string) {
		return this.stockRequestService.getById(id);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async create(@Body() params: CreateStockRequestParamsDto) {
		return this.stockRequestService.create(params);
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async update(
		@Param('id') id: string,
		@Body() params: UpdateStockRequestParamsDto,
	) {
		return this.stockRequestService.update(id, params);
	}
}

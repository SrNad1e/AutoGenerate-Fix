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
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import {
	CreateStockOutputParamsDto,
	FiltersStockOutputDto,
	UpdateStockOutputParamsDto,
} from '../dtos/stock-output.dto';
import { StockOutputService } from '../services/stock-output.service';

@Controller('stock-output')
export class StockOutputController {
	constructor(private stockOutputService: StockOutputService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query() params: FiltersStockOutputDto,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
	) {
		return this.stockOutputService.getAll({
			...params,
			sort,
		});
	}

	@Get(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	getById(@Param('id') id: string) {
		return this.stockOutputService.getById(id);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async create(@Body() params: CreateStockOutputParamsDto) {
		return this.stockOutputService.create(params);
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async update(
		@Param('id') id: string,
		@Body() params: UpdateStockOutputParamsDto,
	) {
		return this.stockOutputService.update(id, params);
	}
}

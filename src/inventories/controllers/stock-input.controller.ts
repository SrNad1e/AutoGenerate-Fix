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
	CreateStockInputParamsDto,
	FiltersStockInputDto,
	UpdateStockInputParamsDto,
} from '../dtos/stock-input.dto';
import { StockInputService } from '../services/stock-input.service';

@Controller('stock-input')
export class StockInputController {
	constructor(private stockInputService: StockInputService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query() params: FiltersStockInputDto,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
	) {
		return this.stockInputService.getAll({
			...params,
			sort,
		});
	}

	@Get(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	getById(@Param('id') id: string) {
		return this.stockInputService.getById(id);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async create(@Body() params: CreateStockInputParamsDto) {
		return this.stockInputService.create(params);
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async update(
		@Param('id') id: string,
		@Body() params: UpdateStockInputParamsDto,
	) {
		return this.stockInputService.update(id, params);
	}
}

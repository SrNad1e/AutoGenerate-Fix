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
	CreateStockAdjustmentParamsDto,
	FiltersStockAdjustmentDto,
	UpdateStockAdjustmentParamsDto,
} from '../dtos/stock-adjustment.dto';
import { StockAdjustmentService } from '../services/stock-adjustment.service';

@Controller('stock-adjustment')
export class StockAdjustmentController {
	constructor(private stockAdjustmentService: StockAdjustmentService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query() params: FiltersStockAdjustmentDto,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
	) {
		return this.stockAdjustmentService.getAll({
			...params,
			sort,
		});
	}

	@Get(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	getById(@Param('id') id: string) {
		return this.stockAdjustmentService.getById(id);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async create(@Body() params: CreateStockAdjustmentParamsDto) {
		return this.stockAdjustmentService.create(params);
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async update(
		@Param('id') id: string,
		@Body() params: UpdateStockAdjustmentParamsDto,
	) {
		return this.stockAdjustmentService.update(id, params);
	}
	stockadjustmentService;
}

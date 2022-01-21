import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import { UsersService } from 'src/users/services/users.service';
import {
	ConfirmDetailTransferDto,
	CreateStockTransferParamsDto,
	FiltersStockTransferDto,
	UpdateStockTransferParamsDto,
} from '../dtos/stock-transfer.dto';
import { StockTransferService } from '../services/stock-transfer.service';

@ApiTags('Traslados de Mercancía')
@Controller('stock-transfer')
export class StockTransferController {
	constructor(
		private userService: UsersService,
		private stockTransferService: StockTransferService,
	) {}
	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query() params: FiltersStockTransferDto,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
	) {
		return this.stockTransferService.getAll({
			...params,
			sort,
		});
	}
	@Get('migrate')
	@UsePipes(new ValidationPipe({ transform: true }))
	showMigrate() {
		return this.stockTransferService.migrate();
	}

	@Get(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	getById(@Param('id') id: string) {
		return this.stockTransferService.getById(id);
	}

	@Post(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async createByRequest(
		@Param('id') idRequest: string,
		@Body('userId') userId: number,
	) {
		return this.stockTransferService.createByRequest(idRequest, userId);
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async create(@Body() params: CreateStockTransferParamsDto) {
		return this.stockTransferService.create(params);
	}

	@Patch('confirm/:transferId/:productId')
	@UsePipes(new ValidationPipe({ transform: true }))
	async confirmItems(
		@Param('transferId') transferId: string,
		@Param('productId') productId: string,
		@Body() params: ConfirmDetailTransferDto,
	) {
		return this.stockTransferService.confirmItems(
			transferId,
			productId,
			params,
		);
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async update(
		@Param('id') id: string,
		@Body() params: UpdateStockTransferParamsDto,
	) {
		return this.stockTransferService.update(id, params);
	}
}

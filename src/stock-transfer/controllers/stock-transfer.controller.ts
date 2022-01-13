import {
	Controller,
	Get,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import { UsersService } from 'src/users/services/users.service';
import { FiltersStockTransferDto } from '../dtos/stock-transfer.dto';
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
}

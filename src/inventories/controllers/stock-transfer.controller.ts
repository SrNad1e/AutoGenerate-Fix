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
import { ObjectId } from 'mongoose';

import {
	ConfirmDetailTransferDto,
	CreateStockTransferParamsDto,
	FiltersStockTransferDto,
	UpdateStockTransferParamsDto,
} from '../dtos/stock-transfer.dto';
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import { StockTransferService } from '../services/stock-transfer.service';

@ApiTags('Traslados de Mercancía')
@Controller('stock-transfer')
export class StockTransferController {
	constructor(private stockTransferService: StockTransferService) {}
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

	@Get('verify/:id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async getVerify(@Param('id') id: string) {
		return this.stockTransferService.getVerify(id);
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
		@Param('id') idRequest: ObjectId,
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

	@Patch('verify/:id')
	@UsePipes(new ValidationPipe({ transform: true }))
	async verify(@Param('id') id: ObjectId) {
		return; //this.stockTransferService.verify(id);
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

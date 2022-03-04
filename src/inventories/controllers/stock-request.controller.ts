import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { StockRequestService } from '../services/stock-request.service';

@ApiTags('Solicitudes de Mercancía')
@Controller('stock-request')
export class StockRequestController {
	constructor(private stockRequestService: StockRequestService) {}

	@Get('migrate')
	@UsePipes(new ValidationPipe({ transform: true }))
	showMigrate() {
		return this.stockRequestService.migrate();
	}
}

import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import { CreateRefundsDto, FiltersRefundsDto } from '../dtos/refunds.dto';
import { RefundsService } from '../services/refunds.service';

@ApiTags('Devoluciones')
@Controller('refunds')
export class RefundsController {
	constructor(private refundsService: RefundsService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query() params: FiltersRefundsDto,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
	) {
		return this.refundsService.getAll({ ...params, sort });
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async create(@Body() params: CreateRefundsDto) {
		return this.refundsService.create(params);
	}
}

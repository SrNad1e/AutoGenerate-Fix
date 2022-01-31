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
import { ParseSortPipePipe } from 'src/common/parse-sort-pipe.pipe';
import { CreateShopParamsDto, FilterShopsDto } from '../dtos/shop.dto';
import { ShopsService } from '../services/shops.service';

@Controller('shops')
export class ShopsController {
	constructor(private shopsService: ShopsService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(
		@Query('limit', ParseIntPipe) limit: number,
		@Query('skip', ParseIntPipe) skip: number,
		@Query('sort', ParseSortPipePipe)
		sort: Record<string, 1 | -1 | { $meta: 'textScore' }>,
		@Query() params: FilterShopsDto,
	) {
		return this.shopsService.getAll({ ...params, limit, skip, sort });
	}

	@Get('migrate')
	migrate() {
		return this.shopsService.migrate();
	}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	create(@Body() params: CreateShopParamsDto) {
		return this.shopsService.create(params);
	}

	@Patch(':id')
	@UsePipes(new ValidationPipe({ transform: true }))
	update(@Param('id') shopId: string, @Body() params: CreateShopParamsDto) {
		return this.shopsService.update(shopId, params);
	}
}

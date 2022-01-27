import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AddConfigurationsParamsDto } from '../dtos/configurations.dto';
import { ConfigurationsService } from '../services/configurations.service';

@ApiTags('configurations')
@Controller('configurations')
export class ConfigurationsController {
	constructor(private configurationsService: ConfigurationsService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getName(@Query('name') name: string, @Query('module') module: string) {
		return this.configurationsService.getForName(module, name);
	}

	@Post(':module')
	@UsePipes(new ValidationPipe({ transform: true }))
	addConfig(
		@Body() params: AddConfigurationsParamsDto,
		@Param('module') module: string,
	) {
		return this.configurationsService.addConfig(module, params);
	}
}

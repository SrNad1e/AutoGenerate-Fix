/* eslint-disable prettier/prettier */
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

import { AddConfigurationsDto } from '../dtos/configurations.dto';
import { Configs, Configuration } from '../entities/configuration.entity';
import { ConfigurationsService } from '../services/configurations.service';

@ApiTags('configurations')
@Controller('configurations')
export class ConfigurationsController {
	constructor(private configurationsService: ConfigurationsService) {}

	@Get()
	@UsePipes(new ValidationPipe({ transform: true }))
	getAll(): Promise<Configuration[]> {
		return this.configurationsService.getAll();
	}

	@Get('name')
	@UsePipes(
		new ValidationPipe({
			transformOptions: { enableImplicitConversion: true },
		}),
	)
	getName(
		@Query('name') name: string,
		@Query('module') module: string,
	): Promise<Configs> {
		return this.configurationsService.getForName(module, name);
	}

	@Get(':module')
	getModule(@Param('module') module: string) {
		return this.configurationsService.getModule(module);
	}

	@Post(':module')
	@UsePipes(new ValidationPipe({ transform: true }))
	addConfig(
		@Body() params: AddConfigurationsDto,
		@Param('module') module: string,
	): Promise<Configuration> {
		return this.configurationsService.addConfig(module, params);
	}
}

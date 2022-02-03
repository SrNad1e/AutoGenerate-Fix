/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
	Configuration,
	ConfigurationSchema,
} from './entities/configuration.entity';
import { ConfigurationsService } from './services/configurations.service';
import { ConfigurationsController } from './controllers/configurations.controller';
import { ConfigurationsResolver } from './resolvers/configurations.resolver';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Configuration.name, schema: ConfigurationSchema },
		]),
	],
	providers: [ConfigurationsResolver, ConfigurationsService],
	controllers: [ConfigurationsController],
	exports: [ConfigurationsService],
})
export class ConfigurationsModule {}

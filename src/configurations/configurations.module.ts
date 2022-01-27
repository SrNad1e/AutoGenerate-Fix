import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
	Configuration,
	ConfigurationSchema,
} from './entities/configuration.entity';
import { ConfigurationsService } from './services/configurations.service';
import { ConfigurationsController } from './controllers/configurations.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Configuration.name, schema: ConfigurationSchema },
		]),
	],
	providers: [ConfigurationsService],
	controllers: [ConfigurationsController],
})
export class ConfigurationsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Conveyor, ConveyorSchema } from './entities/conveyor.entity';
import { Company, CompanySchema } from './entities/company.entity';
import { CompaniesService } from './services/companies.service';
import { ConveyorsService } from './services/conveyors.service';
import { ConveyorsResolver } from './resolvers/conveyors.resolver';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Company.name, schema: CompanySchema },
			{ name: Conveyor.name, schema: ConveyorSchema },
		]),
	],
	providers: [CompaniesService, ConveyorsService, ConveyorsResolver],
	exports: [CompaniesService, ConveyorsService],
})
export class ConfigurationsModule {}

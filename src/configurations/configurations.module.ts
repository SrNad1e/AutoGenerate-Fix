import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Company, CompanySchema } from './entities/company.entity';
import { CompaniesService } from './services/companies.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
	],
	providers: [CompaniesService],
	exports: [CompaniesService],
})
export class ConfigurationsModule {}

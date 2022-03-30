import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Customer, CustomerSchema } from './entities/customer.entity';
import {
	CustomerType,
	CustomerTypeSchema,
} from './entities/customerType.entity';
import { CustomersService } from './services/customers.service';
import { CustomerTypeService } from './services/customer-type.service';
import { CustomersResolver } from './resolvers/customers.resolver';
import { DocumentTypesService } from './services/document-types.service';
import {
	DocumentType,
	DocumentTypeSchema,
} from './entities/documentType.entity';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Customer.name,
				schema: CustomerSchema,
			},
			{
				name: CustomerType.name,
				schema: CustomerTypeSchema,
			},
			{
				name: DocumentType.name,
				schema: DocumentTypeSchema,
			},
		]),
	],
	providers: [
		CustomersService,
		CustomerTypeService,
		CustomersResolver,
		DocumentTypesService,
	],
	exports: [CustomersService, CustomerTypeService],
})
export class CrmModule {}

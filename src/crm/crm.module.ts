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
import { DocumentTypesResolver } from './resolvers/document-types.resolver';
import { City, CitySchema } from './entities/city.entity';
import { CitiesResolver } from './resolvers/cities.resolver';
import { CitiesService } from './services/cities.service';
import { Order, OrderSchema } from 'src/sales/entities/order.entity';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: City.name,
				useFactory: () => {
					const schema = CitySchema;
					schema.index({ name: 1, state: -1, country: -1 }, { unique: true });
					return schema;
				},
			},
			{
				name: Order.name,
				useFactory: () => {
					const schema = OrderSchema;
					schema.index({ number: 1, company: -1 }, { unique: true });
					return schema;
				},
			},
		]),
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
		DocumentTypesResolver,
		CitiesResolver,
		CitiesService,
	],
	exports: [CustomersService, CustomerTypeService],
})
export class CrmModule {}

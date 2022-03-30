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
		]),
	],
	providers: [CustomersService, CustomerTypeService, CustomersResolver],
	exports: [CustomersService, CustomerTypeService],
})
export class CrmModule {}

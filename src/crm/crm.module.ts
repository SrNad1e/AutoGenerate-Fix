import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './entities/customer.entity';
import { CustomersService } from './services/customers.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Customer.name,
				schema: CustomerSchema,
			},
		]),
	],
	providers: [CustomersService],
	exports: [CustomersService],
})
export class CrmModule {}

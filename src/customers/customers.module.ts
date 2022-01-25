/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoicesModule } from 'src/invoices/invoices.module';
import { Customer, CustomerSchema } from './entities/customer.entity';
import { CustomersService } from './services/customers/customers.service';

@Module({
	imports: [
		InvoicesModule,
		MongooseModule.forFeature([
			{ name: Customer.name, schema: CustomerSchema },
		]),
		ScheduleModule.forRoot(),
	],
	providers: [CustomersService],
	exports: [CustomersService],
})
export class CustomersModule {}

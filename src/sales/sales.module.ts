import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmModule } from 'src/crm/crm.module';

import { Order, OrderSchema } from './entities/order.entity';
import { OrdersService } from './services/orders.service';

@Module({
	imports: [
		CrmModule,
		MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
	],
	providers: [OrdersService],
})
export class SalesModule {}

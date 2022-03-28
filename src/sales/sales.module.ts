import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from './entities/order.entity';
import { OrdersService } from './services/orders.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
	],
	providers: [OrdersService],
})
export class SalesModule {}

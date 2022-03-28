import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { Connection } from 'mongoose';
import { CrmModule } from 'src/crm/crm.module';

import { Order, OrderSchema } from './entities/order.entity';
import { OrdersService } from './services/orders.service';
import { ShopsModule } from 'src/shops/shops.module';
import { OrdersResolver } from './resolvers/orders.resolver';

@Module({
	imports: [
		CrmModule,
		ShopsModule,
		MongooseModule.forFeatureAsync([
			{
				name: Order.name,
				useFactory: async (connection: Connection) => {
					const schema = OrderSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'order_increment',
						inc_field: 'number',
						//	start_seq: 1888,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
		]),
	],
	providers: [OrdersService, OrdersResolver],
})
export class SalesModule {}

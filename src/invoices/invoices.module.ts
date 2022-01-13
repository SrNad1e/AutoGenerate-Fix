/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { Connection } from 'mongoose';

import { RefundsController } from './controllers/refunds.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { RefundsService } from './services/refunds.service';
import { InvoicesService } from './services/invoices.service';
import { CouponsModule } from 'src/coupons/coupons.module';
import {
	ProductReturns,
	ProductReturnsSchema,
} from './entities/productreturns.entity';
import { OrdersService } from './services/orders.service';
import { Invoice } from './entities/invoice.entity';
import { Order } from './entities/order.entity';
import { InventoriesModule } from 'src/inventories/inventories.module';
@Module({
	imports: [
		CouponsModule,
		InventoriesModule,
		MongooseModule.forFeatureAsync([
			//TODO: modelo pendiente a cambiar por nombre más simple
			{
				name: ProductReturns.name,
				useFactory: async (connection: Connection) => {
					const schema = ProductReturnsSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, { inc_field: 'code' });
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: Invoice.name,
				useFactory: async (connection: Connection) => {
					const schema = ProductReturnsSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					//schema.plugin(AutoIncrement, { inc_field: 'number' });
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: Order.name,
				useFactory: async (connection: Connection) => {
					const schema = ProductReturnsSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					//schema.plugin(AutoIncrement, { inc_field: 'code' });
					return schema;
				},
				inject: [getConnectionToken('')],
			},
		]),
	],
	controllers: [RefundsController, InvoicesController],
	providers: [RefundsService, InvoicesService, OrdersService],
})
export class InvoicesModule {}

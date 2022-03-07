import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { Inventories } from './entities/inventories.entity';
import {
	StockInProcess,
	StockInProcessSchema,
} from './entities/stockInProcess.entity';
import { StockTransferMysql } from './entities/stock-transfer.migrate.entity';
import {
	StockRequest,
	StockRequestSchema,
	StockTransferDetailMysql,
} from './entities/stock-request.entity';
import { ProductsModule } from 'src/products/products.module';
import { ShopsModule } from 'src/shops/shops.module';
import { UsersModule } from 'src/users/users.module';
import {
	StockTransfer,
	StockTransferSchema,
} from './entities/stock-transfer.entity';
import { StockInput, StockInputSchema } from './entities/stock-input.entity';
import { StockOutput, StockOutputSchema } from './entities/stock-output.entity';
import {
	StockAdjustment,
	StockAdjustmentSchema,
} from './entities/stock-adjustment.entity';
import { InventoriesService } from './services/inventories.service';

@Module({
	imports: [
		ProductsModule,
		ShopsModule,
		UsersModule,
		TypeOrmModule.forFeature([
			Inventories,
			StockTransferDetailMysql,
			StockTransferMysql,
		]),
		MongooseModule.forFeatureAsync([
			{
				name: StockRequest.name,
				useFactory: async (connection: Connection) => {
					const schema = StockRequestSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_request_increment',
						inc_field: 'number',
						//	start_seq: 1888,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: StockTransfer.name,
				useFactory: async (connection: Connection) => {
					const schema = StockTransferSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_transfer_increment',
						inc_field: 'number',
						//	start_seq: 1888,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: StockInput.name,
				useFactory: async (connection: Connection) => {
					const schema = StockInputSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_input_increment',
						inc_field: 'number',
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: StockOutput.name,
				useFactory: async (connection: Connection) => {
					const schema = StockOutputSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_output_increment',
						inc_field: 'number',
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: StockAdjustment.name,
				useFactory: async (connection: Connection) => {
					const schema = StockAdjustmentSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_adjustment_increment',
						inc_field: 'number',
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
			{
				name: StockInProcess.name,
				useFactory: () => StockInProcessSchema,
			},
		]),
	],
	providers: [InventoriesService],
	controllers: [],
	exports: [InventoriesService],
})
export class InventoriesModule {}

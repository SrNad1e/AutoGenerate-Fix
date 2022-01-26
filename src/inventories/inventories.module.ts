/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoriesService } from './services/inventories.service';
import { Inventories } from './entities/inventories.entity';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import {
	StockInProcess,
	StockInProcessSchema,
} from './entities/stockInProcess.entity';
import { StockTransferMysql } from './entities/stock-transfer.migrate.entity';
import { StockTransferDetailMysql } from './entities/stock-transfer-detail.migrate.entity';
import {
	StockRequest,
	StockRequestSchema,
} from './entities/stock-request.entity';
import { Connection } from 'mongoose';
import { StockRequestService } from './services/stock-request.service';
import { StockRequestController } from './controllers/stock-request.controller';
import { ProductsModule } from 'src/products/products.module';
import { ShopsModule } from 'src/shops/shops.module';
import { UsersModule } from 'src/users/users.module';
import { StockTransferController } from './controllers/stock-transfer.controller';
import { StockTransferService } from './services/stock-transfer.service';
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
import { StockInputService } from './services/stock-input.service';
import { StockOutputService } from './services/stock-output.service';
import { StockAdjustmentService } from './services/stock-adjustment.service';
import { StockInputController } from './controllers/stock-input.controller';
import { StockOutputController } from './controllers/stock-output.controller';
import { StockAdjustmentController } from './controllers/stock-adjustment.controller';

@Module({
	imports: [
		ProductsModule,
		ShopsModule,
		UsersModule,
		TypeOrmModule.forFeature([
			Inventories,
			StockTransferMysql,
			StockTransferDetailMysql,
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
	providers: [InventoriesService, StockRequestService, StockTransferService, StockInputService, StockOutputService, StockAdjustmentService],
	controllers: [StockRequestController, StockTransferController, StockInputController, StockOutputController, StockAdjustmentController],
	exports: [InventoriesService, StockRequestService, StockTransferService],
})
export class InventoriesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import {
	StockRequest,
	StockRequestSchema,
} from './entities/stock-request.entity';
import { ProductsModule } from 'src/products/products.module';
import { ShopsModule } from 'src/shops/shops.module';
import {
	StockTransfer,
	StockTransferDetailMysql,
	StockTransferMysql,
	StockTransferSchema,
} from './entities/stock-transfer.entity';
import { StockInput, StockInputSchema } from './entities/stock-input.entity';
import { StockOutput, StockOutputSchema } from './entities/stock-output.entity';
import {
	StockAdjustment,
	StockAdjustmentSchema,
} from './entities/stock-adjustment.entity';
import { StockRequestService } from './services/stock-request.service';
import { StockRequestResolver } from './resolvers/stock-request.resolver';
import { StockTransferService } from './services/stock-transfer.service';
import { StockTransferResolver } from './resolvers/stock-transfer.resolver';
import {
	StockHistory,
	StockHistorySchema,
} from './entities/stock-history.entity';
import { StockHistoryService } from './services/stock-history.service';
import { StockInputService } from './services/stock-input.service';
import { StockInputResolver } from './resolvers/stock-input.resolver';
import { StockOutputService } from './services/stock-output.service';
import { StockAdjustmentService } from './services/stock-adjustment.service';
import { StockOutputResolver } from './resolvers/stock-output.resolver';
import { StockAdjustmentResolver } from './resolvers/stock-adjustment.resolver';
import { Order, OrderSchema } from 'src/sales/entities/order.entity';

@Module({
	imports: [
		ProductsModule,
		ShopsModule,
		TypeOrmModule.forFeature([StockTransferDetailMysql, StockTransferMysql]),
		MongooseModule.forFeature([
			{
				name: StockTransfer.name,
				schema: StockTransferSchema,
			},
			{
				name: StockRequest.name,
				schema: StockRequestSchema,
			},
			{
				name: StockAdjustment.name,
				schema: StockAdjustmentSchema,
			},
			{
				name: StockInput.name,
				schema: StockInputSchema,
			},
			{
				name: StockHistory.name,
				schema: StockHistorySchema,
			},
			{
				name: Order.name,
				schema: OrderSchema,
			},
			{
				name: StockOutput.name,
				schema: StockOutputSchema,
			},
		]),
	],
	providers: [
		StockRequestService,
		StockRequestResolver,
		StockTransferService,
		StockTransferResolver,
		StockHistoryService,
		StockInputService,
		StockInputResolver,
		StockOutputService,
		StockAdjustmentService,
		StockOutputResolver,
		StockAdjustmentResolver,
	],
	controllers: [],
	exports: [StockHistoryService],
})
export class InventoriesModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
	StockRequest,
	StockRequestSchema,
} from './entities/stock-request.entity';
import { ProductsModule } from 'src/products/products.module';
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
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import {
	ReturnOrder,
	ReturnOrderSchema,
} from 'src/sales/entities/return-order.entity';
import {
	StockTransferError,
	StockTransferErrorSchema,
} from './entities/stock-trasnsfer-error.entity';
import { StockTransferErrorsService } from './services/stock-transfer-errors.service';
import { StockTransferErrorsResolver } from './resolvers/stock-transfer-errors.resolver';
import { StockResolver } from './resolvers/stock-service.resolver';
import { StockService } from './services/stock.service';

@Module({
	imports: [
		ProductsModule,
		ConfigurationsModule,
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
			{
				name: ReturnOrder.name,
				schema: ReturnOrderSchema,
			},
			{
				name: StockTransferError.name,
				schema: StockTransferErrorSchema,
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
		StockTransferErrorsService,
		StockTransferErrorsResolver,
		StockResolver,
		StockService
	],
	controllers: [],
	exports: [StockHistoryService],
})
export class InventoriesModule {}

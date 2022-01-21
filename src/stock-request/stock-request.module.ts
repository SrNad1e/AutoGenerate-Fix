import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { InventoriesModule } from 'src/inventories/inventories.module';
import { ProductsModule } from 'src/products/products.module';
import { ShopsModule } from 'src/shops/shops.module';
import { StockTransferDetailMysql } from 'src/stock-transfer/entities/stock-transfer-detail.migrate.entity';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { StockTransferMysql } from 'src/stock-transfer/entities/stock-transfer.migrate.entity';
import { UsersModule } from 'src/users/users.module';
import { StockRequestController } from './controller/stock-request.controller';
import {
	StockRequest,
	StockRequestSchema,
} from './entities/stock-request.entity';
import { StockRequestService } from './services/stock-request.service';

@Module({
	imports: [
		UsersModule,
		ProductsModule,
		ShopsModule,
		InventoriesModule,
		TypeOrmModule.forFeature([StockTransferMysql, StockTransferDetailMysql]),
		MongooseModule.forFeatureAsync([
			{
				name: StockRequest.name,
				useFactory: async (connection: Connection) => {
					const schema = StockRequestSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_request_increment',
						inc_field: 'number',
						start_seq: 1888,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
		]),
	],
	providers: [StockRequestService],
	controllers: [StockRequestController],
	exports: [StockRequestService],
})
export class StockRequestModule {}

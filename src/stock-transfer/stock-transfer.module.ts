import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { Connection } from 'mongoose';

import { StockTransferService } from './services/stock-transfer.service';
import { StockTransferController } from './controllers/stock-transfer.controller';
import { UsersModule } from 'src/users/users.module';
import {
	StockTransfer,
	StockTransferSchema,
} from './entities/stock-transfer.entity';
import { ProductsModule } from 'src/products/products.module';
import { ShopsModule } from 'src/shops/shops.module';
import { InventoriesModule } from 'src/inventories/inventories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransferMysql } from './entities/stock-transfer.migrate.entity';
import { StockTransferDetailMysql } from './entities/stock-transfer-detail.migrate.entity';

@Module({
	imports: [
		UsersModule,
		ProductsModule,
		ShopsModule,
		InventoriesModule,
		TypeOrmModule.forFeature([StockTransferMysql, StockTransferDetailMysql]),
		MongooseModule.forFeatureAsync([
			{
				name: StockTransfer.name,
				useFactory: async (connection: Connection) => {
					const schema = StockTransferSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_increment',
						inc_field: 'number',
						start_seq: 14590,
					});
					return schema;
				},
				inject: [getConnectionToken('')],
			},
		]),
	],
	providers: [StockTransferService],
	controllers: [StockTransferController],
})
export class StockTransferModule {}

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

@Module({
	imports: [
		UsersModule,
		ProductsModule,
		ShopsModule,
		InventoriesModule,
		MongooseModule.forFeatureAsync([
			{
				name: StockTransfer.name,
				useFactory: async (connection: Connection) => {
					const schema = StockTransferSchema;
					const AutoIncrement = AutoIncrementFactory(connection);
					schema.plugin(AutoIncrement, {
						id: 'stock_counter',
						inc_field: 'number',
						inc_amount: 14590,
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

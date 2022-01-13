import { Module } from '@nestjs/common';
import { StockTransferService } from './services/stock-transfer.service';
import { StockTransferController } from './controllers/stock-transfer.controller';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import {
	StockTransfer,
	StockTransferSchema,
} from './entities/stock-transfer.entity';
import { Connection } from 'typeorm';

@Module({
	imports: [
		UsersModule,
		MongooseModule.forFeatureAsync([
			{
				name: StockTransfer.name,
				useFactory: async (connection: Connection) => {
					const schema = StockTransferSchema;
					//const AutoIncrement = AutoIncrementFactory(connection);
					//schema.plugin(AutoIncrement, { inc_field: 'number' });
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

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoriesService } from './services/inventories/inventories.service';
import { Inventories } from './entities/inventories.entity';
import { MongooseModule } from '@nestjs/mongoose';
import {
	StockInProcess,
	StockInProcessSchema,
} from './entities/stockInProcess.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Inventories]),
		MongooseModule.forFeature([
			{
				name: StockInProcess.name,
				schema: StockInProcessSchema,
			},
		]),
	],
	providers: [InventoriesService],
	exports: [InventoriesService],
})
export class InventoriesModule {}

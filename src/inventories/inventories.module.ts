import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoriesService } from './services/inventories/inventories.service';
import { Inventories } from './entities/inventories.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Inventories])],
	providers: [InventoriesService],
	exports: [InventoriesService],
})
export class InventoriesModule {}

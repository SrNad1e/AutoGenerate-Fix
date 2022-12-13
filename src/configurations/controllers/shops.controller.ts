import { Controller, Get } from '@nestjs/common';

import { ShopsService } from '../services/shops.service';
import { WarehousesService } from '../services/warehouses.service';

@Controller('shops')
export class ShopsController {
	constructor(
		private readonly shopsService: ShopsService,
		private readonly warehousesService: WarehousesService,
	) {}

	/*	@Get('migrateShops')
	migrate() {
		return this.shopsService.migrate();
	}

	@Get('migrateWarehouses')
	migrateWarehouses() {
		return this.warehousesService.migrate();
	}*/
}

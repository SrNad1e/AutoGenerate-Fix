import { Controller, Get } from '@nestjs/common';

import { ProductsService } from '../services/products.service';
import { ColorsService } from '../services/colors.service';
import { ProvidersService } from '../services/providers.service';
import { SizesService } from '../services/sizes.service';

@Controller('products')
export class ProductsController {
	constructor(
		private readonly productsService: ProductsService,
		private readonly colorsService: ColorsService,
		private readonly sizesService: SizesService,
		private readonly providersService: ProvidersService,
	) {}

	@Get('migrate')
	async migrateMysql() {
		return this.productsService.migration();
	}

	@Get('migrate/colors')
	async migrateColors() {
		return this.colorsService.migration();
	}

	@Get('migrate/sizes')
	async migrateSizes() {
		return this.sizesService.migration();
	}

	@Get('migrate/providers')
	async migrateProviders() {
		return this.providersService.migration();
	}
}

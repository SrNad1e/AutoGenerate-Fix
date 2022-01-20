import { Controller, Get } from '@nestjs/common';
import { ProductsService } from 'src/products/services/products.service';

@Controller('products')
export class ProductsController {
	constructor(private productService: ProductsService) {}

	@Get('migrate')
	async migrateMysql() {
		return this.productService.migration();
	}
}

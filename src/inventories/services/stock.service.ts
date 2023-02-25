import { Injectable } from '@nestjs/common';
import { FiltersStockInput } from '../dtos/filters-stockService-input';

@Injectable()
export class StockService {
	constructor() {}

	async productsStock(
		/*filtersSalesReportInput: FiltersStockInput,
		companyId: string,*/
	)/*: Promise<ResponseStock>*/ {
		return 'Hola Inventory';
	}
}

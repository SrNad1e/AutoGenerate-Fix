import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { RequirePermissions, Permissions } from 'src/configurations/libs/permissions.decorator';
import { FiltersStockInput } from '../dtos/filters-stockService-input';
import { ResponseStock } from '../dtos/response-stockService';
import { StockService } from '../services/stock.service';

@Resolver()
export class StockResolver {
	constructor(private readonly stockService: StockService) { }

	@Query(() => ResponseStock, {
		name: 'productStock',
		description: 'Consulta el stock de los productos',
	})
	@RequirePermissions(Permissions.READ_STOCK_PRODUCTS)
	getProductInventory(
		@Args({
			name: 'filtersProductStock',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para obtener el stock de los productos',
		})
		_: FiltersStockInput,
		@Context() context
	) {		
		return this.stockService.productsStock(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

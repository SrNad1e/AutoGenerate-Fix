import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersStockTransferInput } from '../dtos/stock-transfer.input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockTransferService } from '../services/stock-transfer.service';

@Resolver(() => StockTransfer)
export class StockTransferResolver {
	constructor(private readonly stockTransferService: StockTransferService) {}

	@Query(() => [StockTransfer], { name: 'stockTransfers' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockTransferInput',
			nullable: true,
			defaultValue: {},
		})
		filtersStockTransferInput: FiltersStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.getAll(context.req.body.variables.input);
	}
}

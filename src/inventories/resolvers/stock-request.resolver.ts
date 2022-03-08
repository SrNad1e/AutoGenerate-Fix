import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockRequestInput } from '../dtos/create-stockRequest-input';
import { FiltersStockRequestInput } from '../dtos/filters-stockRequest.input';
import { ResponseStockRequest } from '../dtos/response-stockRequest';
import { UpdateStockRequestInput } from '../dtos/update-stockRequest-input';
import { StockRequest } from '../entities/stock-request.entity';
import { StockRequestService } from '../services/stock-request.service';

@Resolver()
export class StockRequestResolver {
	constructor(private readonly stockRequestService: StockRequestService) {}

	@Query(() => ResponseStockRequest, { name: 'stockRequests' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockRequestInput',
			nullable: true,
			defaultValue: {},
		})
		_: FiltersStockRequestInput,
		@Context() context,
	) {
		return this.stockRequestService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => StockRequest, { name: 'createStockRequest' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockRequestInput')
		_: CreateStockRequestInput,
		@Context() context,
	) {
		return this.stockRequestService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockRequest, { name: 'updateStockRequest' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateStockRequestInput')
		_: UpdateStockRequestInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.stockRequestService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

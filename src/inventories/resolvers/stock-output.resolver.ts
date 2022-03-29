import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockOutputInput } from '../dtos/create-stockOutput-input';
import { FiltersStockOutputInput } from '../dtos/filters-stockOutput.input';
import { ResponseStockOutput } from '../dtos/response-stockOutput';
import { UpdateStockOutputInput } from '../dtos/update-stockOutput-input';
import { StockOutput } from '../entities/stock-output.entity';
import { StockOutputService } from '../services/stock-output.service';

@Resolver()
export class StockOutputResolver {
	constructor(private readonly stockOutputService: StockOutputService) {}

	@Query(() => ResponseStockOutput, { name: 'stockOutputs' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockOutputInput',
			nullable: true,
			defaultValue: {},
		})
		_: FiltersStockOutputInput,
		@Context() context,
	) {
		return this.stockOutputService.findAll(context.req.body.variables.input);
	}

	@Query(() => StockOutput, { name: 'stockOutputId' })
	@UseGuards(JwtAuthGuard)
	findById(@Args('id') id: string) {
		return this.stockOutputService.findById(id);
	}

	@Mutation(() => StockOutput, { name: 'createStockOutput' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockOutputInput')
		_: CreateStockOutputInput,
		@Context() context,
	) {
		return this.stockOutputService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockOutput, { name: 'updateStockOutput' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateStockOutputInput')
		_: UpdateStockOutputInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.stockOutputService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

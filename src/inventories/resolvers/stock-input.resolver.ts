import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockInputInput } from '../dtos/create-stockInput-input';
import { FiltersStockInputInput } from '../dtos/filters-stockInput.input';
import { ResponseStockInput } from '../dtos/response-stockInput';
import { UpdateStockInputInput } from '../dtos/update-stockInput-input';
import { StockInput } from '../entities/stock-input.entity';
import { StockInputService } from '../services/stock-input.service';

@Resolver()
export class StockInputResolver {
	constructor(private readonly stockInputService: StockInputService) {}

	@Query(() => ResponseStockInput, { name: 'stockInputs' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockInputInput',
			nullable: true,
			defaultValue: {},
		})
		_: FiltersStockInputInput,
		@Context() context,
	) {
		return this.stockInputService.findAll(context.req.body.variables.input);
	}

	@Query(() => StockInput, { name: 'stockInputId' })
	@UseGuards(JwtAuthGuard)
	findById(@Args('id') id: string) {
		return this.stockInputService.findById(id);
	}

	@Mutation(() => StockInput, { name: 'createStockInput' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockRequestInput')
		_: CreateStockInputInput,
		@Context() context,
	) {
		return this.stockInputService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockInput, { name: 'updateStockInput' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateStockInputInput')
		_: UpdateStockInputInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.stockInputService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

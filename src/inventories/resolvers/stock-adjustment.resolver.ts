import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

import { CreateStockAdjustmentInput } from '../dtos/create-stockAdjustment-input';
import { FiltersStockAdjustmentInput } from '../dtos/filters-stockAdjustment.input';
import { ResponseStockAdjustment } from '../dtos/response-stockAdjustment';
import { UpdateStockAdjustmentInput } from '../dtos/update-stockAdjustment-input';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockAdjustmentService } from '../services/stock-adjustment.service';

@Resolver()
export class StockAdjustmentResolver {
	constructor(
		private readonly stockAdjustmentService: StockAdjustmentService,
	) {}

	@Query(() => ResponseStockAdjustment, { name: 'stockAdjustments' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockInputInput',
			nullable: true,
			defaultValue: {},
		})
		_: FiltersStockAdjustmentInput,
		@Context() context,
	) {
		return this.stockAdjustmentService.findAll(
			context.req.body.variables.input,
		);
	}

	@Query(() => StockAdjustment, { name: 'stockAdjustmentId' })
	@UseGuards(JwtAuthGuard)
	findById(@Args('id') id: string) {
		return this.stockAdjustmentService.findById(id);
	}

	@Mutation(() => StockAdjustment, { name: 'createStockAdjustment' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockInputInput')
		_: CreateStockAdjustmentInput,
		@Context() context,
	) {
		return this.stockAdjustmentService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockAdjustment, { name: 'updateStockAdjustment' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateStockInputInput')
		_: UpdateStockAdjustmentInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.stockAdjustmentService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

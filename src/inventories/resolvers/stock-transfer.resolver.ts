import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockTransferInput } from '../dtos/create-stockTransfer-input';
import { FiltersStockTransferInput } from '../dtos/filters-stockTransfer.input';
import { ResponseStockTransfer } from '../dtos/response-stockTransfer';
import {
	DetailStockTransferInput,
	UpdateStockTransferInput,
} from '../dtos/update-stockTransfer-input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockTransferService } from '../services/stock-transfer.service';

@Resolver()
export class StockTransferResolver {
	constructor(private readonly stockTransferService: StockTransferService) {}

	@Query(() => ResponseStockTransfer, { name: 'stockTransfers' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockTransferInput',
			nullable: true,
			defaultValue: {},
		})
		_: FiltersStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => StockTransfer, { name: 'createStockTransfer' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockTransferInput')
		_: CreateStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockTransfer, { name: 'updateStockTransfer' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateStockTransferInput')
		_: UpdateStockTransferInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.stockTransferService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockTransfer, { name: 'confirmDetailStockTransfer' })
	@UseGuards(JwtAuthGuard)
	confirmDetail(
		@Args('updateStockTransferInput')
		_: DetailStockTransferInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.stockTransferService.confirmDetail(
			id,
			context.req.body.variables.input,
		);
	}
}

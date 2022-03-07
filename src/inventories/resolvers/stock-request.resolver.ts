import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockRequestInput } from '../dtos/create-stockRequest-input';
import { UpdateStockRequestInput } from '../dtos/update-stockRequest-input';
import { StockRequest } from '../entities/stock-request.entity';
import { StockRequestService } from '../services/stock-request.service';

@Resolver()
export class StockRequestResolver {
	constructor(private readonly stockRequestService: StockRequestService) {}

	@Mutation(() => StockRequest, { name: 'createStockRequest' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockRequestInput')
		createStockRequestInput: CreateStockRequestInput,
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
		updateStockRequestInput: UpdateStockRequestInput,
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

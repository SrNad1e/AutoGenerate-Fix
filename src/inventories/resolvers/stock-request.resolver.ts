import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { StockRequest } from '../entities/stock-request.entity';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Resolver()
export class StockRequestResolver {
	@Mutation(() => StockRequest)
	@UseGuards(JwtAuthGuard)
	updateUser(
		@Args('updateUserInput') updateUserInput: UpdateUserInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.usersService.update(id, updateUserInput, context.req.user);
	}
}

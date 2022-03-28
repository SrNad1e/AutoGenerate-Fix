import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateOrderInput } from '../dtos/create-order-input';
import { Order } from '../entities/order.entity';
import { OrdersService } from '../services/orders.service';

@Resolver()
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	@Mutation(() => Order, { name: 'createOrder' })
	@UseGuards(JwtAuthGuard)
	create(@Args('createOrderInput') _: CreateOrderInput, @Context() context) {
		return this.ordersService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

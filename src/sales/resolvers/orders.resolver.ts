import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { AddPaymentsOrderInput } from '../dtos/add-payments-order-input';
import { AddProductsOrderInput } from '../dtos/add-products-order-input';
import { CreateOrderInput } from '../dtos/create-order-input';
import { Order } from '../entities/order.entity';
import { OrdersService } from '../services/orders.service';

@Resolver()
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	@Query(() => [Order], { name: 'ordersByPointOfSale' })
	@UseGuards(JwtAuthGuard)
	getByPointOfSales(@Args('idPointOfSale') idPointOfSale: string) {
		return this.ordersService.getByPointOfSales(idPointOfSale);
	}

	@Query(() => [Order], { name: 'orderId' })
	@UseGuards(JwtAuthGuard)
	findById(@Args('id') id: string) {
		return this.ordersService.findById(id);
	}

	@Mutation(() => Order, { name: 'createOrder' })
	@UseGuards(JwtAuthGuard)
	create(@Args('createOrderInput') _: CreateOrderInput, @Context() context) {
		return this.ordersService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Order, { name: 'addProductsOrder' })
	@UseGuards(JwtAuthGuard)
	addProducts(
		@Args('addProductsOrderInput') _: AddProductsOrderInput,
		@Context() context,
	) {
		return this.ordersService.addProducts(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Order, { name: 'addPaymentsOrder' })
	@UseGuards(JwtAuthGuard)
	addPayments(
		@Args('addPaymentsOrderInput') _: AddPaymentsOrderInput,
		@Context() context,
	) {
		return this.ordersService.addPayments(
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

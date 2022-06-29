import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { AddPaymentsOrderInput } from '../dtos/add-payments-order-input';
import { AddProductsOrderInput } from '../dtos/add-products-order-input';
import { CreateOrderInput } from '../dtos/create-order-input';
import { FiltersOrdersInput } from '../dtos/filters-orders.input';
import { ResponseOrder } from '../dtos/response-order';
import { ResponseOrders } from '../dtos/response-orders';
import { UpdateOrderInput } from '../dtos/update-order-input';
import { Order } from '../entities/order.entity';
import { OrdersService } from '../services/orders.service';

@Resolver()
export class OrdersResolver {
	constructor(private readonly ordersService: OrdersService) {}

	@Query(() => ResponseOrders, {
		name: 'orders',
		description: 'Obtener las ordenes',
	})
	@RequirePermissions(Permissions.READ_INVOICING_ORDERS)
	getAll(
		@Args('filtersOrdersInput', {
			description: 'Filtros para la consulta de pedidos',
		})
		_: FiltersOrdersInput,
		@Context() context,
	) {
		return this.ordersService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => [Order], {
		name: 'ordersByPointOfSale',
		description: 'Obtener las ordenes por punto de venta',
	})
	@RequirePermissions(Permissions.ACCESS_POS)
	getByPointOfSales(@Context() context) {
		return this.ordersService.getByPointOfSales(context.req.user.user);
	}

	@Query(() => ResponseOrder, {
		name: 'orderId',
		description: 'Obtiene la orden por el id',
	})
	@RequirePermissions(Permissions.READ_INVOICING_ORDERS)
	findById(
		@Args('id', { description: 'identificador del pedido' }) id: string,
	) {
		return this.ordersService.findById(id);
	}

	@Mutation(() => ResponseOrder, {
		name: 'createOrder',
		description: 'Se encarga de crear el pedido',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_ORDER)
	create(
		@Args('createOrderInput', {
			description: 'Parámetros para la creación del pedido',
		})
		_: CreateOrderInput,
		@Context() context,
	) {
		return this.ordersService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ResponseOrder, {
		name: 'updateOrder',
		description: 'Se encarga actualizar un pedido',
	})
	@RequirePermissions(Permissions.UPDATE_INVOICING_ORDER)
	update(
		@Args('id', { description: 'Identificador del pedido' }) id: string,
		@Args('updateOrderInput', {
			description: 'Parámetros para actualizar el pedido',
		})
		_: UpdateOrderInput,
		@Context() context,
	) {
		return this.ordersService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ResponseOrder, {
		name: 'addProductsOrder',
		description: 'Se encarga de agregar productos a un pedido',
	})
	@RequirePermissions(Permissions.UPDATE_INVOICING_ORDER)
	addProducts(
		@Args('addProductsOrderInput', {
			description: 'Productos del pedido para actualizar',
		})
		_: AddProductsOrderInput,
		@Context() context,
	) {
		return this.ordersService.addProducts(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.companyId,
		);
	}

	@Mutation(() => ResponseOrder, {
		name: 'addPaymentsOrder',
		description: 'Se encarga de agregar medios de pago',
	})
	@RequirePermissions(Permissions.UPDATE_INVOICING_ORDER)
	addPayments(
		@Args('addPaymentsOrderInput', {
			description: 'Medios de pago y orden a actualizar',
		})
		_: AddPaymentsOrderInput,
		@Context() context,
	) {
		return this.ordersService.addPayments(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateReturnOrderInput } from '../dtos/create-return-order-input';
import { FiltersReturnsOrderInput } from '../dtos/filters-returns-order';
import { ResponseReturnsOrder } from '../dtos/response-returns-order';
import { ReturnOrder } from '../entities/return-order.entity';
import { ReturnsOrderService } from '../services/returns-order.service';

@Resolver()
export class ReturnsOrderResolver {
	constructor(private readonly returnsOrderService: ReturnsOrderService) {}

	@Query(() => ResponseReturnsOrder, {
		name: 'returnsOrder',
		description: 'Lista de devoluciones de pedidos',
	})
	@RequirePermissions(Permissions.READ_INVOICING_RETURNS)
	findAll(
		@Args({
			name: 'filtersReturnsOrder',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de devoluciones de pedidos',
		})
		_: FiltersReturnsOrderInput,
		@Context() context,
	) {
		return this.returnsOrderService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => ReturnOrder, {
		name: 'createReturnOrder',
		description: 'Se encarga de crear la devolución del pedido',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_RETURN)
	create(
		@Args('createReturnOrderInput', {
			description: 'Parámetros para la creación de la devolución de pedido',
		})
		_: CreateReturnOrderInput,
		@Context() context,
	) {
		return this.returnsOrderService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

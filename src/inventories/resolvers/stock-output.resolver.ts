import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateStockOutputInput } from '../dtos/create-stockOutput-input';
import { FiltersStockOutputsInput } from '../dtos/filters-stockOutputs.input';
import { ResponseStockOutputs } from '../dtos/response-stockOutputs';
import { UpdateStockOutputInput } from '../dtos/update-stockOutput-input';
import { StockOutput } from '../entities/stock-output.entity';
import { StockOutputService } from '../services/stock-output.service';

@Resolver()
export class StockOutputResolver {
	constructor(private readonly stockOutputService: StockOutputService) {}

	@Query(() => ResponseStockOutputs, {
		name: 'stockOutputs',
		description: 'Listado de salidas de productos',
	})
	@RequirePermissions(Permissions.READ_INVENTORY_OUTPUTS)
	findAll(
		@Args({
			name: 'filtersStockOutputsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros del listado de salidas de productos',
		})
		_: FiltersStockOutputsInput,
		@Context() context,
	) {
		return this.stockOutputService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => StockOutput, {
		name: 'stockOutputId',
		description: 'Obtiene una salida de productos con base al identificador',
	})
	@RequirePermissions(Permissions.READ_INVENTORY_OUTPUTS)
	findById(
		@Args('id', { description: 'Identificador de la salida de productos' })
		id: string,
		@Context() context,
	) {
		return this.stockOutputService.findById(
			id,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockOutput, {
		name: 'createStockOutput',
		description: 'Crea una salida de productos',
	})
	@RequirePermissions(Permissions.CREATE_INVENTORY_OUTPUT)
	create(
		@Args('createStockOutputInput', {
			description: 'Datos para crear una salida de productos',
		})
		_: CreateStockOutputInput,
		@Context() context,
	) {
		return this.stockOutputService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockOutput, {
		name: 'updateStockOutput',
		description: 'Actualiza una salida de productos',
	})
	@RequirePermissions(Permissions.UPDATE_INVENTORY_OUTPUT)
	update(
		@Args('id', {
			description: 'Identificador de la salida de productos a actualizar',
		})
		id: string,
		@Args('updateStockOutputInput', {
			description: 'Datos para actualizar salida de productos',
		})
		_: UpdateStockOutputInput,
		@Context() context,
	) {
		return this.stockOutputService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

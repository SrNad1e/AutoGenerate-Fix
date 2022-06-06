import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateStockInputInput } from '../dtos/create-stockInput-input';
import { FiltersStockInputsInput } from '../dtos/filters-stockInputs.input';
import { ResponseStockInputs } from '../dtos/response-stockInputs';
import { UpdateStockInputInput } from '../dtos/update-stockInput-input';
import { StockInput } from '../entities/stock-input.entity';
import { StockInputService } from '../services/stock-input.service';

@Resolver()
export class StockInputResolver {
	constructor(private readonly stockInputService: StockInputService) {}

	@Query(() => ResponseStockInputs, {
		name: 'stockInputs',
		description: 'Lista de entradas de productos',
	})
	@RequirePermissions(Permissions.READ_INVENTORY_INPUTS)
	findAll(
		@Args({
			name: 'filtersStockInputsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de entradas de productos',
		})
		_: FiltersStockInputsInput,
		@Context() context,
	) {
		return this.stockInputService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => StockInput, {
		name: 'stockInputId',
		description: 'Obtiene una entrada de productos con base a su identificador',
	})
	@RequirePermissions(Permissions.READ_INVENTORY_INPUTS)
	findById(
		@Args('id', { description: 'Identificador de la entrada de productos' })
		id: string,
		@Context() context,
	) {
		return this.stockInputService.findById(
			id,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockInput, {
		name: 'createStockInput',
		description: 'Crea una entrada de productos',
	})
	@RequirePermissions(Permissions.CREATE_INVENTORY_INPUT)
	create(
		@Args('createStockInputInput', {
			description: 'Datos para crear una entrada de productos',
		})
		_: CreateStockInputInput,
		@Context() context,
	) {
		return this.stockInputService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockInput, {
		name: 'updateStockInput',
		description: 'Actualiza una entrada de productos',
	})
	@RequirePermissions(Permissions.UPDATE_INVENTORY_INPUT)
	update(
		@Args('id', {
			description: 'Identificador de la entrada de productos a actualizar',
		})
		id: string,
		@Args('updateStockInputInput', {
			description: 'Datos para actualizar una entrada de productos',
		})
		_: UpdateStockInputInput,
		@Context() context,
	) {
		return this.stockInputService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

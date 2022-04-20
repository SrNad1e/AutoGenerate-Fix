import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockOutputInput } from '../dtos/create-stockOutput-input';
import { FiltersStockOutputInput } from '../dtos/filters-stockOutput.input';
import { ResponseStockOutput } from '../dtos/response-stockOutput';
import { UpdateStockOutputInput } from '../dtos/update-stockOutput-input';
import { StockOutput } from '../entities/stock-output.entity';
import { StockOutputService } from '../services/stock-output.service';

@Resolver()
export class StockOutputResolver {
	constructor(private readonly stockOutputService: StockOutputService) {}

	@Query(() => ResponseStockOutput, {
		name: 'stockOutputs',
		description: 'Listado de salidas de productos',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockOutputInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros del listado de salidas de productos',
		})
		_: FiltersStockOutputInput,
		@Context() context,
	) {
		return this.stockOutputService.findAll(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Query(() => StockOutput, {
		name: 'stockOutputId',
		description: 'Obtiene una salida de productos con base al identificador',
	})
	@UseGuards(JwtAuthGuard)
	findById(
		@Args('id', { description: 'Identificador de la salida de productos' })
		id: string,
		@Context() context,
	) {
		return this.stockOutputService.findById(id, context.req.user);
	}

	@Mutation(() => StockOutput, {
		name: 'createStockOutput',
		description: 'Crea una salida de productos',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockOutputInput', {
			description: 'Datos para crear una salida de productos',
		})
		_: CreateStockOutputInput,
		@Context() context,
	) {
		return this.stockOutputService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockOutput, {
		name: 'updateStockOutput',
		description: 'Actualiza una salida de productos',
	})
	@UseGuards(JwtAuthGuard)
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
			context.req.user,
		);
	}
}

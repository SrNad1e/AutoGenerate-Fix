import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

import { CreateStockAdjustmentInput } from '../dtos/create-stockAdjustment-input';
import { FiltersStockAdjustmentInput } from '../dtos/filters-stockAdjustment.input';
import { ResponseStockAdjustment } from '../dtos/response-stockAdjustment';
import { UpdateStockAdjustmentInput } from '../dtos/update-stockAdjustment-input';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockAdjustmentService } from '../services/stock-adjustment.service';

@Resolver()
export class StockAdjustmentResolver {
	constructor(
		private readonly stockAdjustmentService: StockAdjustmentService,
	) {}

	@Query(() => ResponseStockAdjustment, {
		name: 'stockAdjustments',
		description: 'Lista de ajustes de productos',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockAdjustmentInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de ajustes de productos',
		})
		_: FiltersStockAdjustmentInput,
		@Context() context,
	) {
		return this.stockAdjustmentService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => StockAdjustment, {
		name: 'stockAdjustmentId',
		description: 'Obtiene un ajuste de productos con base a su identificador',
	})
	@UseGuards(JwtAuthGuard)
	findById(
		@Args('id', { description: 'Identificador del ajuste de productos' })
		id: string,
		@Context() context,
	) {
		return this.stockAdjustmentService.findById(
			id,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockAdjustment, {
		name: 'createStockAdjustment',
		description: 'Crea un ajuste de productos',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockAdjustmentInput', {
			description: 'Crea un ajuste de productos',
		})
		_: CreateStockAdjustmentInput,
		@Context() context,
	) {
		return this.stockAdjustmentService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockAdjustment, {
		name: 'updateStockAdjustment',
		description: 'Actualiza un ajuste de productos',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador de ajuste de productos' })
		id: string,
		@Args('updateStockAdjustmentInput', {
			description: 'Datos para actualizar el ajuste de productos',
		})
		_: UpdateStockAdjustmentInput,
		@Context() context,
	) {
		return this.stockAdjustmentService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
			context.req.companyId,
		);
	}
}

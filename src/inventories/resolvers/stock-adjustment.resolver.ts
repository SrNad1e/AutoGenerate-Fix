import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateStockAdjustmentInput } from '../dtos/create-stockAdjustment-input';
import { FiltersStockAdjustmentsInput } from '../dtos/filters-stockAdjustments.input';
import { ResponseStockAdjustments } from '../dtos/response-stockAdjustments';
import { UpdateStockAdjustmentInput } from '../dtos/update-stockAdjustment-input';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockAdjustmentService } from '../services/stock-adjustment.service';

@Resolver()
export class StockAdjustmentResolver {
	constructor(
		private readonly stockAdjustmentService: StockAdjustmentService,
	) {}

	@Query(() => ResponseStockAdjustments, {
		name: 'stockAdjustments',
		description: 'Lista de ajustes de productos',
	})
	@RequirePermissions(Permissions.READ_INVENTORY_ADJUSTMENTS)
	findAll(
		@Args({
			name: 'filtersStockAdjustmentsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de ajustes de productos',
		})
		_: FiltersStockAdjustmentsInput,
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
	@RequirePermissions(Permissions.READ_INVENTORY_ADJUSTMENTS)
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
	@RequirePermissions(Permissions.CREATE_INVENTORY_ADJUSTMENT)
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
	@RequirePermissions(Permissions.UPDATE_INVENTORY_ADJUSTMENT)
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
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

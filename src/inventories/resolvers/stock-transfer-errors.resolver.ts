import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersStockTransfersErrorInput } from '../dtos/filters-stockTransfersError.input';
import { ResponseStockTransfersError } from '../dtos/response-stockTransfersError';
import { VerifiedProductTransferErrorInput } from '../dtos/verifiedProductTransferError.input';
import { StockTransferError } from '../entities/stock-trasnsfer-error.entity';
import { StockTransferErrorsService } from '../services/stock-transfer-errors.service';

@Resolver()
export class StockTransferErrorsResolver {
	constructor(
		private readonly stockTrasnferErrorsService: StockTransferErrorsService,
	) {}

	@Query(() => ResponseStockTransfersError, {
		name: 'stockTransfersError',
		description:
			'Obtiene listado de traslados en error de productos entre bodegas',
	})
	@RequirePermissions(Permissions.INVENTORY_TRANSFERS_VERIFIED)
	findAll(
		@Args({
			name: 'filtersStockTransfersErrorInput',
			nullable: true,
			defaultValue: {},
			description:
				'Filtros para listado de traslados en error de productos entre bodegas',
		})
		_: FiltersStockTransfersErrorInput,
		@Context() context,
	) {
		return this.stockTrasnferErrorsService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => StockTransferError, {
		name: 'verifiedProductStockTransfer',
		description: 'Verifica un producto de un traslado en error',
	})
	@RequirePermissions(Permissions.INVENTORY_TRANSFERS_VERIFIED)
	verified(
		@Args('verifiedProductTransferErrorInput', {
			description: 'Datos para verificar un producto del traslado en error',
		})
		_: VerifiedProductTransferErrorInput,
		@Context() context,
	) {
		return this.stockTrasnferErrorsService.verified(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}

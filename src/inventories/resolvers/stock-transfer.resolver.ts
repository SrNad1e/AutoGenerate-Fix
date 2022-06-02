import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	InventoryPermissions,
	RequirePermissions,
} from 'src/users/libs/permissions.decorator';
import { ConfirmStockTransferInput } from '../dtos/confirmProducts-stockTransfer.input';
import { CreateStockTransferInput } from '../dtos/create-stockTransfer-input';
import { FiltersStockTransfersInput } from '../dtos/filters-stockTransfers.input';
import { ResponseStockTransfers } from '../dtos/response-stockTransfers';
import { UpdateStockTransferInput } from '../dtos/update-stockTransfer-input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockTransferService } from '../services/stock-transfer.service';

@Resolver()
export class StockTransferResolver {
	constructor(private readonly stockTransferService: StockTransferService) {}

	@Query(() => ResponseStockTransfers, {
		name: 'stockTransfers',
		description: 'Obtiene listado de traslados de productos entre bodegas',
	})
	@RequirePermissions(InventoryPermissions.READ_INVENTORY_TRANSFERS)
	findAll(
		@Args({
			name: 'filtersStockTransfersInput',
			nullable: true,
			defaultValue: {},
			description:
				'Filtros para listado de traslados de productos entre bodegas',
		})
		_: FiltersStockTransfersInput,
		@Context() context,
	) {
		return this.stockTransferService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => StockTransfer, {
		name: 'stockTransferId',
		description: 'Consulta el trasldo por el identificador',
	})
	@RequirePermissions(InventoryPermissions.READ_INVENTORY_TRANSFERS)
	findById(
		@Args('id', { description: 'Identificador del traslado' }) id: string,
	) {
		return this.stockTransferService.findById(id);
	}

	@Mutation(() => StockTransfer, {
		name: 'createStockTransfer',
		description: 'Crea una traslado de productos',
	})
	@RequirePermissions(InventoryPermissions.CREATE_INVENTORY_TRANSFER)
	create(
		@Args('createStockTransferInput', {
			description: 'Datos para la creación de un traslado de productos',
		})
		_: CreateStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockTransfer, {
		name: 'updateStockTransfer',
		description: 'Actualiza traslado',
	})
	@RequirePermissions(InventoryPermissions.UPDATE_INVENTORY_TRANSFER)
	update(
		@Args('id', { description: 'Identificador del traslado de productos' })
		id: string,
		@Args('updateStockTransferInput', {
			description: 'Datos para actualizar el traslado',
		})
		_: UpdateStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockTransfer, {
		name: 'confirmProductsStockTransfer',
		description: 'Confirma los productos del traslado',
	})
	@RequirePermissions(InventoryPermissions.CONFIRM_INVENTORY_TRANSFER)
	confirmProducts(
		@Args('id', { description: 'Identificador del traslado de productos' })
		id: string,
		@Args('confirmStockTransferInput', {
			description: 'Datos para confirmar los productos del traslado',
		})
		_: ConfirmStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.confirmDetail(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

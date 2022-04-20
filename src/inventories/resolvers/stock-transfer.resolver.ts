import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockTransferInput } from '../dtos/create-stockTransfer-input';
import { FiltersStockTransferInput } from '../dtos/filters-stockTransfer.input';
import { ResponseStockTransfer } from '../dtos/response-stockTransfer';
import { UpdateStockTransferInput } from '../dtos/update-stockTransfer-input';
import { StockTransfer } from '../entities/stock-transfer.entity';
import { StockTransferService } from '../services/stock-transfer.service';

@Resolver()
export class StockTransferResolver {
	constructor(private readonly stockTransferService: StockTransferService) {}

	@Query(() => ResponseStockTransfer, {
		name: 'stockTransfers',
		description: 'Obtiene listado de traslados de productos entre bodegas',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockTransferInput',
			nullable: true,
			defaultValue: {},
			description:
				'Filtros para listado de traslados de productos entre bodegas',
		})
		_: FiltersStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.findAll(context.req.body.variables.input);
	}

	@Query(() => StockTransfer, {
		name: 'stockTransferId',
		description: 'Consulta el trasldo por el identificador',
	})
	@UseGuards(JwtAuthGuard)
	findById(
		@Args('id', { description: 'Identificador del traslado' }) id: string,
	) {
		return this.stockTransferService.findById(id);
	}

	@Mutation(() => StockTransfer, {
		name: 'createStockTransfer',
		description: 'Crea una traslado de productos',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockTransferInput', {
			description: 'Datos para la creación de un traslado de productos',
		})
		_: CreateStockTransferInput,
		@Context() context,
	) {
		return this.stockTransferService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => StockTransfer, {
		name: 'updateStockTransfer',
		description: 'Actualiza traslado',
	})
	@UseGuards(JwtAuthGuard)
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
			context.req.user,
		);
	}
}

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateStockRequestInput } from '../dtos/create-stockRequest-input';
import { FiltersStockRequestsInput } from '../dtos/filters-stockRequests.input';
import { ResponseStockRequests } from '../dtos/response-stockRequests';
import { UpdateStockRequestInput } from '../dtos/update-stockRequest-input';
import { StockRequest } from '../entities/stock-request.entity';
import { StockRequestService } from '../services/stock-request.service';

@Resolver()
export class StockRequestResolver {
	constructor(private readonly stockRequestService: StockRequestService) {}

	@Query(() => ResponseStockRequests, {
		name: 'stockRequests',
		description: 'Lista las solicitudes de productos',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersStockRequestsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de las solicitudes de productos',
		})
		_: FiltersStockRequestsInput,
		@Context() context,
	) {
		return this.stockRequestService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => StockRequest, {
		name: 'stockRequestId',
		description: 'Obtiene una solicitud de productos por su identificador',
	})
	@UseGuards(JwtAuthGuard)
	findById(
		@Args('id', { description: 'Identificador de la solicitud de productos' })
		id: string,
	) {
		return this.stockRequestService.findById(id);
	}

	@Mutation(() => StockRequest, {
		name: 'createStockRequest',
		description: 'Crea una solicitud',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createStockRequestInput', {
			description: 'Datos para crear una solicitud de productos',
		})
		_: CreateStockRequestInput,
		@Context() context,
	) {
		return this.stockRequestService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockRequest, {
		name: 'updateStockRequest',
		description: 'Actualiza una solicitud de productos',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador de la solicitud de productos' })
		id: string,
		@Args('updateStockRequestInput', {
			description: 'Datos para actualizar en la solicitud de productos',
		})
		_: UpdateStockRequestInput,
		@Context() context,
	) {
		return this.stockRequestService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => StockRequest, {
		name: 'generateStockRequest',
		description: 'Autogenera una solicitud de productos por bodega',
	})
	@UseGuards(JwtAuthGuard)
	autogenerate(
		@Args('shopId', { description: 'Tienda para validar el inventario' })
		shopId: string,
		@Context() context,
	) {
		return this.stockRequestService.autogenerate(
			shopId,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

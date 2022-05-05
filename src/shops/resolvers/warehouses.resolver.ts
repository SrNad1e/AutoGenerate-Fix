import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

import { FiltersWarehousesInput } from '../dtos/filters-warehouses.input';
import { ResponseWarehouses } from '../dtos/response-warehouses';
import { Warehouse } from '../entities/warehouse.entity';
import { WarehousesService } from '../services/warehouses.service';

@Resolver(() => Warehouse)
export class WarehousesResolver {
	constructor(private readonly warehousesService: WarehousesService) {}

	@Query(() => ResponseWarehouses, {
		name: 'warehouses',
		description: 'Se encarga de listar las bodegas',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersWarehousesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las bodegas',
		})
		_: FiltersWarehousesInput,
		@Context() context,
	) {
		return this.warehousesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => Warehouse, {
		name: 'warehouseId',
		description: 'Se encarga de traer bodega por identificador',
	})
	@UseGuards(JwtAuthGuard)
	findById(
		@Args({
			name: 'warehouseId',
			description: 'Identificador de la bodega',
		})
		id: string,
	) {
		return this.warehousesService.findById(id);
	}
}

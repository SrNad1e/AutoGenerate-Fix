import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateWarehouseInput } from '../dtos/create-warehouse.input';
import { FiltersWarehousesInput } from '../dtos/filters-warehouses.input';
import { ResponseWarehouses } from '../dtos/response-warehouses';
import { UpdateWarehouseInput } from '../dtos/update-warehouse.input';
import { Warehouse } from '../entities/warehouse.entity';
import { WarehousesService } from '../services/warehouses.service';

@Resolver(() => Warehouse)
export class WarehousesResolver {
	constructor(private readonly warehousesService: WarehousesService) {}

	@Query(() => ResponseWarehouses, {
		name: 'warehouses',
		description: 'Se encarga de listar las bodegas',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_WAREHOUSES)
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
	@RequirePermissions(Permissions.READ_CONFIGURATION_WAREHOUSES)
	findById(
		@Args({
			name: 'warehouseId',
			description: 'Identificador de la bodega',
		})
		id: string,
	) {
		return this.warehousesService.findById(id);
	}

	@Mutation(() => Warehouse, {
		name: 'createWarehouse',
		description: 'Crea una bodega',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_WAREHOUSE)
	create(
		@Args('createWarehouseInput', {
			description: 'Datos para la creación de la bodega',
		})
		_: CreateWarehouseInput,
		@Context() context,
	) {
		return this.warehousesService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Warehouse, {
		name: 'updateWarehouse',
		description: 'Actualiza una bodega',
	})
	@RequirePermissions(Permissions.UPDATE_CONFIGURATION_WAREHOUSE)
	update(
		@Args('id', {
			description: 'Identificador de la bodega para actualizar',
		})
		id: string,
		@Args('updateWarehouseInput', {
			description: 'Datos para actualizar la bodega',
		})
		_: UpdateWarehouseInput,
		@Context() context,
	) {
		return this.warehousesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
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
}

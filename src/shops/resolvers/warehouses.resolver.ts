import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

import { FiltersWarehouseInput } from '../dtos/filters-warehouse.input';
import { Warehouse } from '../entities/warehouse.entity';
import { WarehousesService } from '../services/warehouses.service';

@Resolver(() => Warehouse)
export class WarehousesResolver {
	constructor(private readonly warehousesService: WarehousesService) {}

	@Query(() => [Warehouse], { name: 'warehouses' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersWarehouseInput', nullable: true, defaultValue: {} })
		filtersWarehouseInput: FiltersWarehouseInput,
		@Context() context,
	) {
		return this.warehousesService.findAll(
			context.req.body.variables.input || {},
		);
	}
}

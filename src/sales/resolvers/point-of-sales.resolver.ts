import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreatePointOfSaleInput } from '../dtos/create-pointOfSale.input';
import { FiltersPointOfSalesInput } from '../dtos/filters-point-of-sales.input';
import { ResponsePointOfSales } from '../dtos/response-point-of-sales';
import { UpdatePointOfSaleInput } from '../dtos/update-pointOfSale.input';
import { PointOfSale } from '../entities/pointOfSale.entity';
import { PointOfSalesService } from '../services/point-of-sales.service';

@Resolver()
export class PointOfSalesResolver {
	constructor(private readonly pointOfSalesService: PointOfSalesService) {}

	@Query(() => ResponsePointOfSales, {
		name: 'pointOfSales',
		description: 'Lista de puntos de venta',
	})
	@RequirePermissions(Permissions.READ_INVOICING_POINTOFSALES)
	findAll(
		@Args({
			name: 'filtersPointOfSales',
			nullable: true,
			defaultValue: {},
			description: 'Filtros de lista de puntos de venta',
		})
		_: FiltersPointOfSalesInput,
		@Context() context,
	) {
		return this.pointOfSalesService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => PointOfSale, {
		name: 'createPointOfSale',
		description: 'Se encarga de crear el punto de venta',
	})
	@RequirePermissions(Permissions.CREATE_INVOICING_POINTOFSALE)
	create(
		@Args('createPointOfSaleInput', {
			description: 'Parámetros para la creación del punto de venta',
		})
		_: CreatePointOfSaleInput,
		@Context() context,
	) {
		return this.pointOfSalesService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => PointOfSale, {
		name: 'updatePointOfSale',
		description: 'Se encarga actualizar un punto de venta',
	})
	@RequirePermissions(Permissions.UPDATE_INVOICING_POINTOFSALE)
	update(
		@Args('id', { description: 'Identificador deL punto de venta' }) id: string,
		@Args('updatePointOfSaleInput', {
			description: 'Parámetros para actualizar el punto de venta',
		})
		_: UpdatePointOfSaleInput,
		@Context() context,
	) {
		return this.pointOfSalesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateShopInput } from '../dtos/create-shop.input';
import { FiltersShopsInput } from '../dtos/filters-shops.input';
import { ResponseShops } from '../dtos/response-shops';
import { UpdateShopInput } from '../dtos/update-shop.input';
import { Shop } from '../entities/shop.entity';
import { ShopsService } from '../services/shops.service';

@Resolver()
export class ShopsResolver {
	constructor(private readonly shopsService: ShopsService) {}

	@Query(() => ResponseShops, {
		name: 'shops',
		description: 'Se encarga de listar las tiendas',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_SHOPS)
	findAll(
		@Args({
			name: 'filtersShopsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las tiendas',
		})
		_: FiltersShopsInput,
		@Context() context,
	) {
		return this.shopsService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => Shop, {
		name: 'shopId',
		description: 'Obtiene la tienda por el identificador',
	})
	@RequirePermissions(Permissions.READ_CONFIGURATION_SHOPS)
	findById(
		@Args('id', { description: 'Identificador de la tienda' }) id: string,
	) {
		return this.shopsService.findById(id);
	}

	@Mutation(() => Shop, {
		name: 'createShop',
		description: 'Crea una tienda',
	})
	@RequirePermissions(Permissions.CREATE_CONFIGURATION_SHOP)
	create(
		@Args('createShopInput', {
			description: 'Datos para la creación de la tienda',
		})
		_: CreateShopInput,
		@Context() context,
	) {
		return this.shopsService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Shop, {
		name: 'updateShop',
		description: 'Actualiza una tienda',
	})
	@RequirePermissions(Permissions.UPDATE_CONFIGURATION_SHOP)
	update(
		@Args('id', {
			description: 'Identificador de la tienda para actualizar',
		})
		id: string,
		@Args('updateShopInput', {
			description: 'Datos para actualizar la tienda',
		})
		_: UpdateShopInput,
		@Context() context,
	) {
		return this.shopsService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

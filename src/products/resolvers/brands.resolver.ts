import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateBrandInput } from '../dtos/create-brand.input';
import { FiltersBrandsInput } from '../dtos/filters-brands.input';
import { ResponseBrands } from '../dtos/response-brands';
import { UpdateBrandInput } from '../dtos/update-brand.input';
import { Brand } from '../entities/brand.entity';
import { BrandsService } from '../services/brands.service';

@Resolver()
export class BrandsResolver {
	constructor(private readonly brandsService: BrandsService) {}

	@Query(() => ResponseBrands, {
		name: 'brands',
		description: 'Listado de marcas',
	})
	findAll(
		@Args({
			name: 'filtersBrandsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para listar las marcas',
		})
		_: FiltersBrandsInput,
		@Context() context,
	) {
		return this.brandsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Brand, { name: 'createBrand', description: 'Crea una marca' })
	@RequirePermissions(Permissions.CREATE_INVENTORY_BRAND)
	create(
		@Args('createBrandInput', { description: 'Datos para crear una marca' })
		_: CreateBrandInput,
		@Context() context,
	) {
		return this.brandsService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => Brand, {
		name: 'updateBrand',
		description: 'Actualiza la marca',
	})
	@RequirePermissions(Permissions.UPDATE_INVENTORY_BRAND)
	update(
		@Args('id', { description: 'Identificador de la marca a actualizar' })
		id: string,
		@Args('updateBrandInput', { description: 'Datos a actualizar en la marca' })
		_: UpdateBrandInput,
		@Context() context,
	) {
		return this.brandsService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
		);
	}
}

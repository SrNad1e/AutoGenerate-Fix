import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
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
	@UseGuards(JwtAuthGuard)
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
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createBrandInput', { description: 'Datos para crear una marca' })
		_: CreateBrandInput,
		@Context() context,
	) {
		return this.brandsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Brand, {
		name: 'updateBrand',
		description: 'Actualiza la marca',
	})
	@UseGuards(JwtAuthGuard)
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
			context.req.user,
		);
	}
}

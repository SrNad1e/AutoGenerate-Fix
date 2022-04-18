import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateSizeInput } from '../dtos/create-size.input';
import { FiltersSizeInput } from '../dtos/filters-size.input';
import { ResponseSize } from '../dtos/response-size';
import { UpdateSizeInput } from '../dtos/update-size.input';
import { Size } from '../entities/size.entity';
import { SizesService } from '../services/sizes.service';

@Resolver(() => Size)
export class SizesResolver {
	constructor(private readonly sizesService: SizesService) {}

	@Query(() => ResponseSize, {
		name: 'sizes',
		description: 'Listar las tallas',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersSizeInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las tallas',
		})
		_: FiltersSizeInput,
		@Context() context,
	) {
		return this.sizesService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Size, { name: 'createSize', description: 'Crear una talla' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createSizeInput', { description: 'Datos para crear la talla' })
		_: CreateSizeInput,
		@Context() context,
	) {
		return this.sizesService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Size, {
		name: 'updateSize',
		description: 'Actualizar la talla',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador de la talla a actualizar' })
		id: string,
		@Args('updateSizeInput', { description: 'Datos para actualizar la talla' })
		_: UpdateSizeInput,
		@Context() context,
	) {
		return this.sizesService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

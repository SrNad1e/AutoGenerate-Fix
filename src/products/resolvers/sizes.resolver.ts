import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	InventoryPermissions,
	RequirePermissions,
} from 'src/users/libs/permissions.decorator';

import { CreateSizeInput } from '../dtos/create-size.input';
import { FiltersSizesInput } from '../dtos/filters-sizes.input';
import { ResponseSizes } from '../dtos/response-sizes';
import { UpdateSizeInput } from '../dtos/update-size.input';
import { Size } from '../entities/size.entity';
import { SizesService } from '../services/sizes.service';

@Resolver(() => Size)
export class SizesResolver {
	constructor(private readonly sizesService: SizesService) {}

	@Query(() => ResponseSizes, {
		name: 'sizes',
		description: 'Listar las tallas',
	})
	findAll(
		@Args({
			name: 'filtersSizesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las tallas',
		})
		_: FiltersSizesInput,
		@Context() context,
	) {
		return this.sizesService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Size, { name: 'createSize', description: 'Crear una talla' })
	@RequirePermissions(InventoryPermissions.CREATE_INVENTORY_SIZE)
	create(
		@Args('createSizeInput', { description: 'Datos para crear la talla' })
		_: CreateSizeInput,
		@Context() context,
	) {
		return this.sizesService.create(
			context.req.body.variables.input,
			context.req.user.user,
		);
	}

	@Mutation(() => Size, {
		name: 'updateSize',
		description: 'Actualizar la talla',
	})
	@RequirePermissions(InventoryPermissions.UPDATE_INVENTORY_SIZE)
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
			context.req.user.user,
		);
	}
}

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateBoxInput } from '../dtos/create-box.input';
import { FiltersBoxesInput } from '../dtos/filters-boxes.input';
import { ResponseBoxes } from '../dtos/response-boxes.input';
import { UpdateBoxInput } from '../dtos/update-box.input';
import { Box } from '../entities/box.entity';
import { BoxService } from '../services/box.service';

@Resolver()
export class BoxesResolver {
	constructor(private readonly boxService: BoxService) {}

	@Query(() => ResponseBoxes, {
		name: 'boxes',
		description: 'Se encarga de listar las cajas',
	})
	@RequirePermissions(Permissions.READ_TREASURY_BOXES)
	findAll(
		@Args({
			name: 'filtersBoxesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar las cajas',
		})
		_: FiltersBoxesInput,
		@Context() context,
	) {
		return this.boxService.findAll(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Box, {
		name: 'createBox',
		description: 'Crea una caja',
	})
	@RequirePermissions(Permissions.CREATE_TREASURY_BOX)
	create(
		@Args('createBoxInput', {
			description: 'Datos para la creación de la caja',
		})
		_: CreateBoxInput,
		@Context() context,
	) {
		return this.boxService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Box, {
		name: 'updateBox',
		description: 'Actualiza una caja',
	})
	@RequirePermissions(Permissions.UPDATE_TREASURY_BOX)
	update(
		@Args('id', {
			description: 'Identificador de la caja',
		})
		id: string,
		@Args('updateBoxInput', {
			description: 'Datos para actualizar la caja',
		})
		_: UpdateBoxInput,
		@Context() context,
	) {
		return this.boxService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

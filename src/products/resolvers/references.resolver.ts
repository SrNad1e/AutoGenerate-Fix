import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';

import { CreateReferenceInput } from '../dtos/create-reference.input';
import { FiltersReferencesInput } from '../dtos/filters-references.input';
import { ResponseReferences, ReferenceData } from '../dtos/response-references';
import { UpdateReferenceInput } from '../dtos/update-reference';
import { StatusProduct } from '../entities/product.entity';
import { Reference } from '../entities/reference.entity';
import { ReferencesService } from '../services/references.service';

@Resolver()
export class ReferencesResolver {
	constructor(private readonly referencesService: ReferencesService) {}

	@Query(() => ResponseReferences, {
		name: 'references',
		description: 'Listado de las referencias',
	})
	findAll(
		@Args({
			name: 'companyId',
			description: 'Identificador de la empresa',
		})
		companyId: string,
		@Args({
			name: 'filtersReferencesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para las referencias',
		})
		_: FiltersReferencesInput,
		@Context() context,
	) {
		return this.referencesService.findAll(
			context.req.body.variables.input,
			true,
			companyId,
		);
	}

	@Query(() => ReferenceData, {
		name: 'referenceId',
		description: 'Obtiene la referencia por el identificador',
	})
	findById(
		@Args('id', { description: 'Identificador de la referencia' }) id: string,
		@Args('productsStatus', {
			description: 'Estados de los productos que desea traer o nulo',
			nullable: true,
		})
		productsStatus: string,
	) {
		return this.referencesService.findById(id, productsStatus);
	}

	@Mutation(() => Reference, {
		name: 'createReference',
		description: 'Crea una referencia',
	})
	@RequirePermissions(Permissions.CREATE_INVENTORY_REFERENCE)
	create(
		@Args('createReferenceInput', {
			description: 'Datos para la creación de la referencia',
		})
		_: CreateReferenceInput,
		@Context() context,
	) {
		return this.referencesService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Reference, {
		name: 'updateReference',
		description: 'Actualiza una referencia',
	})
	@RequirePermissions(Permissions.UPDATE_INVENTORY_REFERENCE)
	update(
		@Args('id', {
			description: 'Identificador de la referencia para actualizar',
		})
		id: string,
		@Args('updateReferenceInput', {
			description: 'Datos para actualizar la referencia',
		})
		_: UpdateReferenceInput,
		@Context() context,
	) {
		return this.referencesService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}

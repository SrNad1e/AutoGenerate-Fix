import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateReferenceInput } from '../dtos/create-reference.input';
import { FiltersReferencesInput } from '../dtos/filters-references.input';
import { ResponseReferences } from '../dtos/response-references';
import { UpdateReferenceInput } from '../dtos/update-reference';
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
			context.req.user,
		);
	}

	@Query(() => Reference, {
		name: 'referenceId',
		description: 'Obtiene la referencia por el identificador',
	})
	@UseGuards(JwtAuthGuard)
	findById(
		@Args('id', { description: 'Identificador de la referencia' }) id: string,
		@Context() context,
	) {
		return this.referencesService.findById(id, context.req.user);
	}

	@Mutation(() => Reference, {
		name: 'createReference',
		description: 'Crea una referencia',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createReferenceInput', {
			description: 'Datos para la creación de la referencia',
		})
		_: CreateReferenceInput,
		@Context() context,
	) {
		return this.referencesService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Reference, {
		name: 'updateReference',
		description: 'Actualiza una referencia',
	})
	@UseGuards(JwtAuthGuard)
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
			context.req.user,
		);
	}
}

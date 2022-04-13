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

	@Query(() => ResponseReferences, { name: 'references' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersReferencesInput', nullable: true, defaultValue: {} })
		_: FiltersReferencesInput,
		@Context() context,
	) {
		return this.referencesService.findAll(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Query(() => Reference, { name: 'referenceId' })
	@UseGuards(JwtAuthGuard)
	findById(@Args('id') id: string, @Context() context) {
		return this.referencesService.findById(id, context.req.user);
	}

	@Mutation(() => Reference, { name: 'createReference' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createReferenceInput')
		_: CreateReferenceInput,
		@Context() context,
	) {
		return this.referencesService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Reference, { name: 'updateReference' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateReferenceInput')
		_: UpdateReferenceInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.referencesService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

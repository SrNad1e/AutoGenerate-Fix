import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersReferencesInput } from '../dtos/filters-references.input';
import { ResponseReferences } from '../dtos/response-references';
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
}

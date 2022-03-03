import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersSizeInput } from '../dtos/filters-size.input';
import { Size } from '../entities/size.entity';
import { SizesService } from '../services/sizes.service';

@Resolver(() => Size)
export class SizesResolver {
	constructor(private readonly sizesService: SizesService) {}

	@Query(() => [Size], { name: 'sizes' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersSizeInput', nullable: true, defaultValue: {} })
		filtersSizeInput: FiltersSizeInput,
		@Context() context,
	) {
		return this.sizesService.findAll(context.req.body.variables.input);
	}
}

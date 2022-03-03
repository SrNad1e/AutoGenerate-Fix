import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersColorInput } from '../dtos/filters-color.input';
import { Color } from '../entities/color.entity';
import { ColorsService } from '../services/colors.service';

@Resolver(() => Color)
export class ColorsResolver {
	constructor(private readonly colorsService: ColorsService) {}

	@Query(() => [Color], { name: 'colors' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersColorInput', nullable: true, defaultValue: {} })
		filtersColorInput: FiltersColorInput,
		@Context() context,
	) {
		return this.colorsService.findAll(context.req.body.variables.input);
	}
}

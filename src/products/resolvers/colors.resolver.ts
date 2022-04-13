import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { ResponseColor } from '../dtos/response-color';
import { FiltersColorInput } from '../dtos/filters-color.input';
import { Color } from '../entities/color.entity';
import { ColorsService } from '../services/colors.service';
import { UpdateColorInput } from '../dtos/update-color.input';
import { CreateColorInput } from '../dtos/create-color.input';

@Resolver(() => Color)
export class ColorsResolver {
	constructor(private readonly colorsService: ColorsService) {}

	@Query(() => ResponseColor, { name: 'colors' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersColorInput', nullable: true, defaultValue: {} })
		filtersColorInput: FiltersColorInput,
		@Context() context,
	) {
		return this.colorsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Color, { name: 'createColor' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createColorInput')
		_: CreateColorInput,
		@Context() context,
	) {
		return this.colorsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Color, { name: 'updateColor' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateSizeInput')
		_: UpdateColorInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.colorsService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

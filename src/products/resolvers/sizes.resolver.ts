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

	@Query(() => ResponseSize, { name: 'sizes' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersSizeInput', nullable: true, defaultValue: {} })
		_: FiltersSizeInput,
		@Context() context,
	) {
		return this.sizesService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Size, { name: 'createSize' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createSizeInput')
		_: CreateSizeInput,
		@Context() context,
	) {
		return this.sizesService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Size, { name: 'updateSize' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateSizeInput')
		_: UpdateSizeInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.sizesService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

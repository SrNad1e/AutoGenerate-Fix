import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateBrandInput } from '../dtos/create-brand.input';
import { FiltersBrandsInput } from '../dtos/filters-brands.input';
import { ResponseBrands } from '../dtos/response-brands';
import { UpdateBrandInput } from '../dtos/update-brand.input';
import { Brand } from '../entities/brand.entity';
import { BrandsService } from '../services/brands.service';

@Resolver()
export class BrandsResolver {
	constructor(private readonly brandsService: BrandsService) {}

	@Query(() => ResponseBrands, { name: 'brands' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersBrandsInput', nullable: true, defaultValue: {} })
		_: FiltersBrandsInput,
		@Context() context,
	) {
		return this.brandsService.findAll(context.req.body.variables.input);
	}

	@Mutation(() => Brand, { name: 'createBrand' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createBrandInput')
		_: CreateBrandInput,
		@Context() context,
	) {
		return this.brandsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Brand, { name: 'updateBrand' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateBrandInput')
		_: UpdateBrandInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.brandsService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

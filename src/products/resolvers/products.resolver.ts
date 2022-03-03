import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { FiltersProductInput } from '../dtos/filters-product.input';

import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';

@Resolver(() => Product)
export class ProductsResolver {
	constructor(private readonly productsService: ProductsService) {}

	@Query(() => [Product], { name: 'colors' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersProductInput', nullable: true, defaultValue: {} })
		filtersProductInput: FiltersProductInput,
		@Context() context,
	) {
		return this.productsService.findAll(context.req.body.variables.input);
	}
}

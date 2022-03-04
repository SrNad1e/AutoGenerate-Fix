import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-product.input';
import { ResponseProduct } from '../dtos/response-product';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';

@Resolver(() => Product)
export class ProductsResolver {
	constructor(private readonly productsService: ProductsService) {}

	@Query(() => ResponseProduct, { name: 'products' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersProductsInput', nullable: true, defaultValue: {} })
		filtersProductsInput: FiltersProductsInput,
		@Context() context,
	) {
		return this.productsService.findAll(context.req.body.variables.input);
	}

	@Query(() => Product, { name: 'product' })
	@UseGuards(JwtAuthGuard)
	findOne(
		@Args({ name: 'filtersProductInput', nullable: true, defaultValue: {} })
		filtersProductInput: FiltersProductInput,
		@Context() context,
	) {
		return this.productsService.findOne(context.req.body.variables.input);
	}
}

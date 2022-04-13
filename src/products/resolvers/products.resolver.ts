import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { CreateProductInput } from '../dtos/create-product.input';
import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-product.input';
import { ResponseProduct } from '../dtos/response-product';
import { UpdateProductInput } from '../dtos/update-product.input';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';

@Resolver(() => Product)
export class ProductsResolver {
	constructor(private readonly productsService: ProductsService) {}

	@Query(() => ResponseProduct, { name: 'products' })
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({ name: 'filtersProductsInput', nullable: true, defaultValue: {} })
		_: FiltersProductsInput,
		@Context() context,
	) {
		return this.productsService.findAll(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Query(() => Product, { name: 'product' })
	@UseGuards(JwtAuthGuard)
	findOne(
		@Args({ name: 'filtersProductInput', nullable: true, defaultValue: {} })
		_: FiltersProductInput,
		@Context() context,
	) {
		return this.productsService.findOne(context.req.body.variables.input);
	}

	@Mutation(() => Product, { name: 'createProduct' })
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createProductInput')
		_: CreateProductInput,
		@Context() context,
	) {
		return this.productsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Product, { name: 'updateProduct' })
	@UseGuards(JwtAuthGuard)
	update(
		@Args('updateProductInput')
		_: UpdateProductInput,
		@Args('id') id: string,
		@Context() context,
	) {
		return this.productsService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

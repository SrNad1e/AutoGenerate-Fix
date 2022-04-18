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

	@Query(() => ResponseProduct, {
		name: 'products',
		description: 'Lista los productos',
	})
	@UseGuards(JwtAuthGuard)
	findAll(
		@Args({
			name: 'filtersProductsInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consoltar los productos',
		})
		_: FiltersProductsInput,
		@Context() context,
	) {
		return this.productsService.findAll(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Query(() => Product, { name: 'product', description: 'Obtiene un producto' })
	@UseGuards(JwtAuthGuard)
	findOne(
		@Args({
			name: 'filtersProductInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para obtener el primer producto de la busqueda',
		})
		_: FiltersProductInput,
		@Context() context,
	) {
		return this.productsService.findOne(context.req.body.variables.input);
	}

	@Mutation(() => Product, {
		name: 'createProduct',
		description: 'Crea un producto',
	})
	@UseGuards(JwtAuthGuard)
	create(
		@Args('createProductInput', { description: 'Datos para crear un producto' })
		_: CreateProductInput,
		@Context() context,
	) {
		return this.productsService.create(
			context.req.body.variables.input,
			context.req.user,
		);
	}

	@Mutation(() => Product, {
		name: 'updateProduct',
		description: 'Se encarga actualizar un producto',
	})
	@UseGuards(JwtAuthGuard)
	update(
		@Args('id', { description: 'Identificador del producto a actualizar' })
		id: string,
		@Args('updateProductInput', {
			description: 'Datos a actualizar en el producto',
		})
		_: UpdateProductInput,
		@Context() context,
	) {
		return this.productsService.update(
			id,
			context.req.body.variables.input,
			context.req.user,
		);
	}
}

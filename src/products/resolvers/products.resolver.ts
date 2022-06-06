import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';

import { CreateProductInput } from '../dtos/create-product.input';
import {
	FiltersProductInput,
	FiltersProductsInput,
} from '../dtos/filters-products.input';
import { ResponseProducts } from '../dtos/response-products';
import { UpdateProductInput } from '../dtos/update-product.input';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';

@Resolver(() => Product)
export class ProductsResolver {
	constructor(private readonly productsService: ProductsService) {}

	@Query(() => ResponseProducts, {
		name: 'products',
		description: 'Lista los productos',
	})
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
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Query(() => Product, { name: 'product', description: 'Obtiene un producto' })
	@RequirePermissions(Permissions.READ_INVENTORY_PRODUCTS)
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
	@RequirePermissions(Permissions.CREATE_INVENTORY_PRODUCT)
	create(
		@Args('createProductInput', { description: 'Datos para crear un producto' })
		_: CreateProductInput,
		@Context() context,
	) {
		return this.productsService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Product, {
		name: 'updateProduct',
		description: 'Se encarga actualizar un producto',
	})
	@RequirePermissions(Permissions.UPDATE_INVENTORY_PRODUCT)
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
			context.req.user.user,
		);
	}
}

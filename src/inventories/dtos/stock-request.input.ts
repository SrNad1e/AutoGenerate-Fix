import { Field, InputType } from '@nestjs/graphql';

import { Product } from 'src/products/entities/product.entity';

@InputType()
export class DetailRequest {
	@Field(() => Product, { description: 'Producto de la solicitud' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de productos agregados' })
	quantity: number;
}

@InputType()
export class CreateStockRequestInput {
	@Field(() => DetailRequest, { description: 'Detalles de la solicitud' })
	details: DetailRequest[];

	@Field(() => String, { description: 'Id de bodega de destino' })
	warehouseDestination: string;

	@Field(() => String, { description: 'Id de bodega de origen' })
	warehouseOrigin: string;

	@Field(() => String, { description: 'Observación de la solicitud' })
	observation: string;
}

import { Field, InputType } from '@nestjs/graphql';

import { Product } from 'src/products/entities/product.entity';

@InputType({ description: 'Datos para calcular el valor del descuento' })
export class FindDiscountInput {
	@Field(() => String, {
		description: 'Identificador del cliente para validar el descuento',
		nullable: true,
	})
	customerId: string;

	@Field(() => String, {
		description: 'Producto para validar el descuento',
		nullable: true,
	})
	product: Product;
}

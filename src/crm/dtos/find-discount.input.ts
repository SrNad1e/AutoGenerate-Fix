import { Field, InputType } from '@nestjs/graphql';

import { Reference } from 'src/products/entities/reference.entity';

@InputType({ description: 'Datos para calcular el valor del descuento' })
export class FindDiscountInput {
	@Field(() => String, {
		description: 'Identificador del cliente para validar el descuento',
		nullable: true,
	})
	customerId: string;

	@Field(() => Reference, {
		description: 'Referencia para validar el descuento',
		nullable: true,
	})
	reference: Reference;
}
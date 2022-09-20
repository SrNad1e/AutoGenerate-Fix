import { Field, InputType } from '@nestjs/graphql';

import { Reference } from 'src/products/entities/reference.entity';

@InputType({ description: 'Datos para calcular el valor del descuento' })
export class FindDiscountInput {
	@Field(() => String, {
		description: 'Identificador del cliente para validar el descuento',
		nullable: true,
	})
	customerId?: string;

	@Field(() => Reference, {
		description: 'Referencia para validar el descuento',
		nullable: true,
	})
	reference?: Reference;

	@Field(() => String, {
		description: 'Compañía a la que pertenece la regla',
	})
	companyId: string;

	@Field(() => String, {
		description: 'Identificador del tipo de cliente para validar el descuento',
		nullable: true,
	})
	customerTypeId?: string;

	@Field(() => String, {
		description: 'Identificador de la tienda para validar el descuento',
		nullable: true,
	})
	shopId?: string;
}

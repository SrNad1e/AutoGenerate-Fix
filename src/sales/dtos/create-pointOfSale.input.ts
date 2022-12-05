import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un punto de venta' })
export class CreatePointOfSaleInput {
	@Field(() => String, { description: 'Nombre del punto de venta' })
	name: string;

	@Field(() => String, {
		description: 'Identificador de la tienda a la que pertence',
	})
	shopId: string;

	@Field(() => String, {
		description: 'Identificador de la autorización de facturación',
	})
	autorizationId: string;

	@Field(() => String, { description: 'Identificador de la caja asignada' })
	boxId: string;
}

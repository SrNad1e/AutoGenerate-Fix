import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar un punto de venta' })
export class UpdatePointOfSaleInput {
	@Field(() => String, {
		description: 'Fecha de cierre del punto de venta',
		nullable: true,
	})
	closeDate?: string;

	@Field(() => Boolean, {
		description: 'Cerrando punto de venta',
		nullable: true,
	})
	closing?: boolean;
}

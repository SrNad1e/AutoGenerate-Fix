import { Field, InputType } from '@nestjs/graphql';

@InputType({
	description: 'Datos para consultar los medios de pago de los pedidos',
})
export class DataGetPaymentsOrderInput {
	@Field(() => String, {
		description: 'Fecha inicial para el cálculo de las ventas',
	})
	dateInitial: string;

	@Field(() => String, {
		description: 'Fecha final para el cálculo de las ventas',
	})
	dateFinal: string;

	@Field(() => String, {
		description: 'Identificador del punto de venta a calcular',
		nullable: true,
	})
	pointOfSaleId?: string;
}

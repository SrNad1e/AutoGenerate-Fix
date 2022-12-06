import { Field, InputType } from '@nestjs/graphql';

@InputType({
	description:
		'Datos para consultar resumen de las devoluciones en un rango de fechas',
})
export class ResumeDayReturnsOrderInput {
	@Field(() => String, {
		description:
			'Punto de venta para consultar las devoluciones o vacío si se necesitan todas',
		nullable: true,
	})
	pointOfSaleId?: string;

	@Field(() => String, { description: 'Fecha final para la consulta' })
	dateFinal: string;

	@Field(() => String, { description: 'Fecha inicial para la consulta' })
	dateInitial: string;
}

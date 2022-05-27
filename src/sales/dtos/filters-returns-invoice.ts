import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de las devoluciones en factura' })
export class SortReturnInovice {
	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de actualización',
		nullable: true,
	})
	updatedAt: number;
}

@InputType({ description: 'Filtros de listado de devoluciones de facturación' })
export class FiltersReturnsInvoiceInput {
	@Field(() => SortReturnInovice, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortReturnInovice;

	@Field(() => String, {
		description: 'Fecha inicial para la busqueda',
		nullable: true,
	})
	dateInitial: string;

	@Field(() => String, {
		description: 'Fecha final para la busqueda',
		nullable: true,
	})
	dateFinal: string;

	@Field(() => Boolean, {
		description: 'Si la devolucion de encuentra se encuentra activ<',
		nullable: true,
	})
	active: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

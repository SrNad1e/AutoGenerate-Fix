import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de facturas' })
export class SortInovice {
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

@InputType({ description: 'Filtros del listado de facturas' })
export class FiltersInvoicesInput {
	@Field(() => SortInovice, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort?: SortInovice;

	@Field(() => String, {
		description: 'Fecha inicial para la busqueda',
		nullable: true,
	})
	dateInitial?: string;

	@Field(() => String, {
		description: 'Fecha final para la busqueda',
		nullable: true,
	})
	dateFinal?: string;

	@Field(() => String, {
		description: 'Identificador del punto de venta',
		nullable: true,
	})
	pointOfSaleId?: string;

	@Field(() => String, {
		description: 'Identificador de la tienda',
		nullable: true,
	})
	shopId?: string;

	@Field(() => [String], {
		description: 'Identificador de los medios de pago',
		nullable: true,
	})
	paymentIds?: string[];

	@Field(() => Boolean, {
		description: 'Si la factura de encuentra se encuentra activa',
		nullable: true,
	})
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

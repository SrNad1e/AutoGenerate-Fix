import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de cierre z' })
export class SortCloseXInvoicing {
	@Field(() => Number, {
		description: 'Ordenamiento por numero',
		nullable: true,
	})
	number: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de cierre',
		nullable: true,
	})
	closeDate: number;

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

@InputType({ description: 'Filtros para consultar los cierres X' })
export class FiltersClosesXInvoicingInput {
	@Field(() => Number, {
		description: 'Número del cierre',
		nullable: true,
	})
	number: number;

	@Field(() => String, {
		description: 'Tienda del cierre',
		nullable: true,
	})
	shopId: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortCloseXInvoicing, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortCloseXInvoicing;

	@Field(() => String, {
		description: 'Fecha del cierre',
		nullable: true,
	})
	closeDate: string;
}

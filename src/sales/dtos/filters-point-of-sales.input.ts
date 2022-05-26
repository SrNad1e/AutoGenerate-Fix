import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de colores' })
export class SortPointOfSale {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	closeDate?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros para obtener los puntos de venta' })
export class FiltersPointOfSalesInput {
	@Field({ description: 'Identificador del punto de venta', nullable: true })
	_id?: string;

	@Field({ description: 'Comodín busqueda del punto de venta', nullable: true })
	name?: string;

	@Field({
		description: 'Tienda a la que pertenecen los puntos de venta',
		nullable: true,
	})
	shopId?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortPointOfSale, { description: 'Ordenamiento', nullable: true })
	sort?: SortPointOfSale;
}

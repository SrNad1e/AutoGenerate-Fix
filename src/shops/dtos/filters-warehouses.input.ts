import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la bodega' })
export class SortWarehouse {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	active?: number;

	@Field(() => Number, { nullable: true })
	isMain?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros de las bodegas' })
export class FiltersWarehousesInput {
	@Field({ description: 'Identificador de la bodega', nullable: true })
	_id?: string;

	@Field({ description: 'Comodín busqueda de la bodega', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;

	@Field({
		description: 'Si se requiere traer la bodega principal',
		nullable: true,
	})
	isMain?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortWarehouse, { description: 'Ordenamiento', nullable: true })
	sort?: SortWarehouse;
}

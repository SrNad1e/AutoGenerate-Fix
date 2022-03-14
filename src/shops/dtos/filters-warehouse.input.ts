import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortWarehouse {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	active?: number;

	@Field(() => Number, { nullable: true })
	isMain?: number;
}

@InputType()
export class FiltersWarehouseInput {
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

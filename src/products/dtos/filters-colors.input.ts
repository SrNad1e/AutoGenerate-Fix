import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de colores' })
export class SortColor {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	name_internal?: number;

	@Field({ nullable: true })
	active?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros para la lista de colores' })
export class FiltersColorsInput {
	@Field({ description: 'Identificador del color', nullable: true })
	_id?: string;

	@Field({ description: 'Comodín busqueda del color', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortColor, { description: 'Ordenamiento', nullable: true })
	sort?: SortColor;
}

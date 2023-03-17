import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de las zonas' })
export class SortRegion {
	@Field({ nullable: true })
	city?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;

	@Field({ nullable: true })
	active?: number;
}

@InputType({ description: 'Datos para consultar la zona' })
export class FiltersRegionInput {
	@Field(() => String, { description: 'Identificador del rol', nullable: true })
	_id?: string;

	@Field(() => String, { description: 'Nombre de la zona', nullable: true })
	city: string;


	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortRegion, { description: 'Ordenamiento', nullable: true })
	sort?: SortRegion;
}

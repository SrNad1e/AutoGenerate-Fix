import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la trasnportadora' })
export class SortCompany {
	@Field(() => Number, {
		description: 'Ordenamiento por nombre',
		nullable: true,
	})
	name?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por nombre',
		nullable: true,
	})
	active?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por nombre',
		nullable: true,
	})
	regimenSimplify?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	updatedAt?: number;
}

@InputType({ description: 'Filtros para obtener listado de compañías' })
export class FiltersCompaniesInput {
	@Field(() => String, {
		description: 'Comódin para buscar por nombre o documento',
		nullable: true,
	})
	name?: string;

	@Field(() => Boolean, {
		description: 'Estado de la compañía',
		nullable: true,
	})
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortCompany, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort?: SortCompany;
}

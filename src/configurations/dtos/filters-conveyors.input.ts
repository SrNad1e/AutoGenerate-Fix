import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la trasnportadora' })
export class SortConveyor {
	@Field(() => Number, {
		description: 'Ordenamiento por nombre',
		nullable: true,
	})
	name: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	updatedAt: number;
}

@InputType({ description: 'Filtros para obtener listado de transportadoras' })
export class FiltersConveyorsInput {
	@Field(() => String, {
		description: 'Nombre de la transportadora',
		nullable: true,
	})
	name?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortConveyor, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortConveyor;
}

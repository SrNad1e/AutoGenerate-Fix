import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la ciudad' })
export class SortCity {
	@Field(() => Number, {
		description: 'ordernamiento por documento',
		nullable: true,
	})
	name: number;

	@Field(() => Number, {
		description: 'ordernamiento por país',
		nullable: true,
	})
	country: number;

	@Field(() => Number, {
		description: 'ordernamiento por estado',
		nullable: true,
	})
	state: number;

	@Field(() => Number, {
		description: 'ordernamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;

	@Field(() => Number, {
		description: 'ordernamiento por fecha de actualización',
		nullable: true,
	})
	updatedAt: number;
}

@InputType({ description: 'Filtros para obtener las ciudades' })
export class FiltersCitiesInput {
	@Field(() => String, {
		description: 'Identificador de la ciudad',
		nullable: true,
	})
	_id?: string;

	@Field(() => String, { description: 'Nombre de la ciudad', nullable: true })
	name: string;

	@Field(() => String, { description: 'Nombre del país', nullable: true })
	country: string;

	@Field(() => String, {
		description: 'Nombre del departamento',
		nullable: true,
	})
	state: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortCity, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortCity;
}

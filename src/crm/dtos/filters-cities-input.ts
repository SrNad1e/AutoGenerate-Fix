import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la ciudad' })
export class SortCity {
	@Field(() => Number, { description: 'ordernamiento por documento' })
	name: number;

	@Field(() => Number, { description: 'ordernamiento por país' })
	country: number;

	@Field(() => Number, { description: 'ordernamiento por estado' })
	state: number;

	@Field(() => Number, { description: 'ordernamiento por fecha de creación' })
	createdAt: number;

	@Field(() => Number, {
		description: 'ordernamiento por fecha de actualización',
	})
	updatedAt: number;
}

@InputType({ description: 'Filtros para obtener las ciudades' })
export class FiltersCitiesInput {
	@Field(() => String, { description: 'Nombre de la ciudad' })
	name: string;

	@Field(() => String, { description: 'Nombre del país' })
	country: string;

	@Field(() => String, { description: 'Nombre del departamento' })
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

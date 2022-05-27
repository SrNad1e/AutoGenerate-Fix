import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de los egresos' })
export class SortPayment {
	@Field(() => Number, { nullable: true })
	number?: number;

	@Field(() => Number, { nullable: true })
	type?: number;

	@Field(() => Number, { nullable: true })
	value?: number;

	@Field(() => Number, { nullable: true })
	status?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

@InputType({
	description: 'Filtros para obtener el listado de egresos',
})
export class FiltersExpensesInput {
	@Field(() => String, {
		description: 'Caja a la que afecta el egreso',
		nullable: true,
	})
	boxId?: string;

	@Field(() => String, {
		description: 'Estado del egreso (active, inactive)',
		nullable: true,
	})
	status?: string;

	@Field(() => String, {
		description: 'Fecha inicial de la busqueda',
		nullable: true,
	})
	dateInitial?: string;

	@Field(() => String, {
		description: 'Fecha final de la busqueda',
		nullable: true,
	})
	dateFinal?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortPayment, { description: 'Ordenamiento', nullable: true })
	sort?: SortPayment;
}

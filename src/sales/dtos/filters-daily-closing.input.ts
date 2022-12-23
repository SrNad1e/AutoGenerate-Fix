import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de cierre z' })
export class SortDailyClosing {
	@Field(() => Number, {
		description: 'Ordenamiento por fecha de cierre',
		nullable: true,
	})
	closeDate: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;
}

@InputType({ description: 'Filtros para cierre fiscal' })
export class FiltersDailyClosing {
	@Field(() => String, {
		description: 'Fecha inicial del cierre del cierre',
		nullable: true,
	})
	dateInitial: string;

	@Field(() => String, {
		description: 'Fecha final del cierre del cierre',
		nullable: true,
	})
	dateFinal?: string;

	@Field({ nullable: true })
	pointOfSaleId?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortDailyClosing, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortDailyClosing;
}

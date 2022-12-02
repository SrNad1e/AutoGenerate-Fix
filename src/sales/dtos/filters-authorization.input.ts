import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de las autorizaciones' })
export class SortAuthorization {
	@Field(() => Number, {
		description: 'Ordenamiento por prefijo',
		nullable: true,
	})
	prefix?: number;
}

@InputType({ description: 'Filtros para consultar las autorizaciones' })
export class FiltersAuthorizationInput {
	@Field(() => String, {
		description: 'Prefijo de facturación',
		nullable: true,
	})
	prefix?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortAuthorization, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort?: SortAuthorization;
}

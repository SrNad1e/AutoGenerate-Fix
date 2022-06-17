import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para consultar la cajas' })
export class FiltersBoxesInput {
	@Field(() => String, {
		description: 'Nombre de la caja para buscar coincidencias',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Identificador de la caja',
		nullable: true,
	})
	_id: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;
}

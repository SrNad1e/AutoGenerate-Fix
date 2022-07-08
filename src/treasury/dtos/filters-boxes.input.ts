import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de las cajas' })
export class SortBox {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	base?: number;

	@Field(() => Number, { nullable: true })
	total?: number;

	@Field(() => Number, { nullable: true })
	isMain?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

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

	@Field(() => SortBox, { description: 'Ordenamiento', nullable: true })
	sort?: SortBox;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;
}

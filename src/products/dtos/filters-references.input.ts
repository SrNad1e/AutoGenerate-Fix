import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de referencias' })
export class SortReference {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	description?: number;

	@Field(() => Number, { nullable: true })
	changeable?: number;

	@Field(() => Number, { nullable: true })
	price?: number;

	@Field(() => Number, { nullable: true })
	cost?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros para la lista de referencias' })
export class FiltersReferencesInput {
	@Field(() => String, {
		description: 'Comodín para la busqueda de las referencias',
		nullable: true,
	})
	name?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => Number, {
		description: 'Precio para la busqueda de referencias',
		nullable: true,
	})
	price?: number;

	@Field(() => Number, {
		description: 'Costo para la busqueda de referencias',
		nullable: true,
	})
	cost?: number;

	@Field(() => String, {
		description: 'Identificación de la marca',
		nullable: true,
	})
	brandId?: string;

	@Field(() => String, {
		description: 'Identificación de la marca',
		nullable: true,
	})
	categoryLevel1Id?: string;

	@Field(() => String, {
		description: 'Identificación de la marca',
		nullable: true,
	})
	categoryLevel2Id?: string;

	@Field(() => String, {
		description: 'Identificación de la marca',
		nullable: true,
	})
	categoryLevel3Id?: string;

	@Field(() => Boolean, { description: 'Referencia activa', nullable: true })
	active?: boolean;

	@Field(() => Boolean, {
		description: 'Referencia se puede cambiar',
		nullable: true,
	})
	changeable?: boolean;

	@Field(() => String, {
		description: 'Identificador del cliente para validar descuentos',
		nullable: true,
	})
	customerId?: string;

	@Field(() => SortReference, { description: 'Ordenamiento', nullable: true })
	sort?: SortReference;
}

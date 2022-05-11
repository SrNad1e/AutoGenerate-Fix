import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la tienda' })
export class SortShop {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	status?: number;

	@Field(() => Number, { nullable: true })
	address?: number;

	@Field(() => Number, { nullable: true })
	phone?: number;

	@Field(() => Number, { nullable: true })
	goal?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros usados para consultar las tiendas' })
export class FiltersShopsInput {
	@Field(() => String, { description: 'Comodín de la tienda', nullable: true })
	name?: string;

	@Field(() => String, {
		description: 'Estado de la tienda (active, inactive, suspend)',
		nullable: true,
	})
	status?: string;

	@Field(() => String, {
		description: 'Dirección de la sucursal',
		nullable: true,
	})
	address?: string;

	@Field(() => String, {
		description: 'Teléfono de la sucursal',
		nullable: true,
	})
	phone?: string;

	@Field(() => Number, {
		description: 'Meta asignada a la tienda',
		nullable: true,
	})
	goal?: number;

	@Field(() => String, {
		description: 'Bodega por defecto para la sucursal',
		nullable: true,
	})
	defaultWarehouseId?: string;

	@Field(() => String, {
		description: 'Empresa de la tienda',
		nullable: true,
	})
	companyId?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortShop, { description: 'Ordenamiento', nullable: true })
	sort?: SortShop;
}

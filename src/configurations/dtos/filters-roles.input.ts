import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de roles' })
export class SortRole {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;

	@Field({ nullable: true })
	active?: number;

	@Field({ nullable: true })
	changeWarehouse?: number;
}

@InputType({ description: 'Filtros para consultar los roles' })
export class FiltersRolesInput {
	@Field(() => String, { description: 'Nombre del rol', nullable: true })
	name: string;

	@Field(() => Boolean, {
		description: 'El rol se encuentra activo',
		nullable: true,
	})
	active: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortRole, { description: 'Ordenamiento', nullable: true })
	sort?: SortRole;
}

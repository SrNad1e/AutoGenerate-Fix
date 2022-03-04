import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortColor {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	name_internal?: number;

	@Field({ nullable: true })
	active?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType()
export class FiltersColorInput {
	@Field({ description: 'Comodín busqueda del color', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	skip?: number;

	@Field(() => SortColor, { description: 'Ordenamiento', nullable: true })
	sort?: SortColor;
}

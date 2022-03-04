import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortSize {
	@Field({ nullable: true })
	value?: number;

	@Field({ nullable: true })
	active?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType()
export class FiltersSizeInput {
	@Field({ description: 'Comodín busqueda de la talla', nullable: true })
	name?: string;

	@Field({ description: 'Estado de la bodega', nullable: true })
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	skip?: number;

	@Field(() => SortSize, { description: 'Ordenamiento', nullable: true })
	sort?: SortSize;
}

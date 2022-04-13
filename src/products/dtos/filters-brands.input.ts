import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortBrand {
	@Field({ nullable: true })
	name?: number;

	@Field({ nullable: true })
	active?: number;

	@Field({ nullable: true })
	createdAt?: number;

	@Field({ nullable: true })
	updatedAt?: number;
}

@InputType()
export class FiltersBrandsInput {
	@Field(() => String, { description: 'Nombre del atributo', nullable: true })
	name?: string;

	@Field({ description: 'Estado del atributo', nullable: true })
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortBrand, { description: 'Ordenamiento', nullable: true })
	sort?: SortBrand;
}

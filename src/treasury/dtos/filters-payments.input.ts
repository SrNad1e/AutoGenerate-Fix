import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento de la teinda' })
export class SortPayment {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	type?: number;

	@Field(() => Number, { nullable: true })
	active?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

@InputType({
	description: 'Filtros para obtener el listado de tipos de medios de pago',
})
export class FiltersPaymentsInput {
	@Field(() => String, {
		description: 'Nombre del medio de pago',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Tipo de medio de pago (cash, bank, credit, bonus)',
		nullable: true,
	})
	type?: string;

	@Field(() => Boolean, {
		description: 'Estado del tipo de los médios de pago',
		nullable: true,
	})
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortPayment, { description: 'Ordenamiento', nullable: true })
	sort?: SortPayment;
}

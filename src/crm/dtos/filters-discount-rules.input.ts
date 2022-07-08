import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para el ordenamiento' })
export class SortDiscountRule {
	@Field(() => Number, { nullable: true })
	name?: number;

	@Field(() => Number, { nullable: true })
	value?: number;

	@Field(() => Number, { nullable: true })
	percent?: number;

	@Field(() => Number, { nullable: true })
	dateInitial?: number;

	@Field(() => Number, { nullable: true })
	dateFinal?: number;

	@Field(() => Number, { nullable: true })
	active?: number;

	@Field(() => Number, { nullable: true })
	createdAt?: number;

	@Field(() => Number, { nullable: true })
	updatedAt?: number;
}

@InputType({ description: 'Filtros para consultar las reglas de descuentos' })
export class FiltersDiscountRulesInput {
	@Field(() => String, {
		description: 'Comodín para el nombre de la regla',
		nullable: true,
	})
	name?: string;

	@Field(() => Number, {
		description: 'Valor en cantidad del descuento',
		nullable: true,
	})
	value?: number;

	@Field(() => Number, {
		description: 'Porcentaje del descuento',
		nullable: true,
	})
	percent?: number;

	@Field(() => Boolean, {
		description: 'Si el descuento se encuentra activo',
		nullable: true,
	})
	active?: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortDiscountRule, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortDiscountRule;
}

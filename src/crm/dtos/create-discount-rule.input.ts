import { Field, InputType } from '@nestjs/graphql';

import { DocumentTypesRule, TypesRule } from '../entities/discountRule.entity';

@InputType({ description: 'Regla de descuento' })
export class RuleInput {
	@Field(() => DocumentTypesRule, {
		description: 'Tipo de documento para validar el descuento',
	})
	documentType: DocumentTypesRule;

	@Field(() => [String], {
		description: 'Identificador de los documentos',
	})
	documentIds: string[];

	@Field(() => [String], {
		description: 'Tipo de regla que deben cumplir los documentos',
	})
	type: TypesRule;
}

@InputType({ description: 'Datos para crear un descuento' })
export class CreateDiscountRuleInput {
	@Field(() => String, { description: 'Nombre del descuento' })
	name: string;

	@Field(() => [RuleInput], { description: 'Reglas a aplicar' })
	rules: RuleInput[];

	@Field(() => Number, { description: 'Valor del descuento', nullable: true })
	value?: number;

	@Field(() => Number, {
		description: 'Porcentaje del descuento',
		nullable: true,
	})
	percent?: number;

	@Field(() => String, {
		description: 'Fecha inicial para aplicar el descuento',
	})
	dateInitial: string;

	@Field(() => String, {
		description: 'Fecha final para aplicar el descuento',
	})
	dateFinal: string;
}

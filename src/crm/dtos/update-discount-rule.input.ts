import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateDiscountRuleInput } from './create-discount-rule.input';

@InputType({ description: 'Datos para actualizar el descuento' })
export class UpdateDiscountRuleInput extends PartialType(
	CreateDiscountRuleInput,
) {
	@Field(() => Boolean, { description: 'Estado del descuento' })
	active?: boolean;
}

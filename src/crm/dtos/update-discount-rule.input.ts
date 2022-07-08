import { Field, PartialType } from '@nestjs/graphql';

import { CreateDiscountRuleInput } from './create-discount-rule.input';

export class UpdateDiscountRuleInput extends PartialType(
	CreateDiscountRuleInput,
) {
	@Field(() => Boolean, { description: 'Estado del descuento' })
	active?: boolean;
}

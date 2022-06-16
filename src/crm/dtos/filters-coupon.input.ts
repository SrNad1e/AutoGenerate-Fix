import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para consultar un cupón' })
export class FiltersCouponInput {
	@Field(() => String, { description: 'Código del cupón', nullable: true })
	code?: string;
}

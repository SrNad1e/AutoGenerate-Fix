import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para obtener un crédito' })
export class FiltersCreditInput {
	@Field(() => String, {
		description: 'Cliente que tiene asignado el crédito',
		nullable: true,
	})
	customerId?: string;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para consultar un cliente' })
export class FiltersCustomerInput {
	@Field(() => String, { description: 'Documento del cliente' })
	document: string;
}

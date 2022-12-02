import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para consultar la tienda' })
export class FiltersShopInput {
	@Field(() => String, { description: 'Nombre de la tienda', nullable: true })
	name?: string;
}

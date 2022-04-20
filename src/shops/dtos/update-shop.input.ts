import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateShopInput } from './create-shop.input';

@InputType({ description: 'Datos para actualizar la tienda' })
export class UpdateShopInput extends PartialType(CreateShopInput) {
	@Field(() => String, { description: 'Estado de la tienda', nullable: true })
	status: string;
}

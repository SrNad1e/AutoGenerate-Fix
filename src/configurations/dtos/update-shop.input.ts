import { Field, InputType, PartialType } from '@nestjs/graphql';

import { StatusShop } from '../entities/shop.entity';
import { CreateShopInput } from './create-shop.input';

@InputType({ description: 'Datos para actualizar la tienda' })
export class UpdateShopInput extends PartialType(CreateShopInput) {
	@Field(() => StatusShop, {
		description: 'Estado de la tienda',
		nullable: true,
	})
	status: StatusShop;

	@Field(() => String, {
		description: 'Identificador de la empresa para la tienda',
		nullable: true,
	})
	companyId?: string;
}

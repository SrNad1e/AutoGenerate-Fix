import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateAuthorizationInput } from './create-authorization.input';

@InputType({ description: 'Datos para actualizar la autorización' })
export class UpdateAuthorizationInput extends PartialType(
	CreateAuthorizationInput,
) {
	@Field(() => Date, {
		description: 'Fecha de cierre',
		nullable: true,
	})
	lastDateInvoicing?: Date;

	@Field(() => Number, {
		description: 'Ultimo número usado para facturar',
	})
	lastNumber?: number;
}

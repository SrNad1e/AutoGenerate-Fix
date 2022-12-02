import { InputType, PartialType } from '@nestjs/graphql';

import { CreateAuthorizationInput } from './create-authorization.input';

@InputType({ description: 'Datos para actualizar la autorización' })
export class UpdateAuthorizationInput extends PartialType(
	CreateAuthorizationInput,
) {}

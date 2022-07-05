import { PartialType } from '@nestjs/graphql';

import { CreateAuthorizationInput } from './create-authorization.input';

export class UpdateAuthorizationInput extends PartialType(
	CreateAuthorizationInput,
) {}

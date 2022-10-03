import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Respuesta del api de fedex' })
export class ResponseAuthorizationFedex {
	@Field(() => String, { description: 'Token para las consultas' })
	access_token: string;

	@Field(() => String, { description: 'Tipo de token' })
	token_type: string;

	@Field(() => Number, { description: 'Tiempo de expiración' })
	expires_in: number;

	@Field(() => String, { description: 'Ambito del token' })
	scope: string;
}

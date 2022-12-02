import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Respuesta del api de fedex' })
export class ResponseAuthorizationInterrapidisimo {
	@Field(() => String, { description: 'Token para las consultas' })
	Access_token: string;

	@Field(() => String, { description: 'Tipo de token' })
	Token_tipe: string;

	@Field(() => Number, { description: 'Tiempo de expiración' })
	ExpiresIn: number;
}

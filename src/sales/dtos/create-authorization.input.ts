import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de una autorización' })
export class CreateAuthorizationInput {
	@Field(() => String, { description: 'Prefijo de facturación' })
	prefix: string;
}

import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginUserInput {
	@Field({ description: 'Usuario registrado' })
	username: string;

	@Field({ description: 'Contraseña de usuario' })
	password: string;

	@Field({ description: 'Identificador de la compañía del usuario' })
	companyId: string;
}

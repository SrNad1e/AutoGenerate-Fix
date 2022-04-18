import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Datos para hacer login' })
export class LoginUserInput {
	@Field({ description: 'Usuario registrado' })
	username: string;

	@Field({ description: 'Contraseña de usuario' })
	password: string;

	@Field({ description: 'Identificador de la compañía' })
	companyId: string;
}

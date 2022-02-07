import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
	@Field({ description: 'Usuario registrado' })
	username: string;

	@Field({ description: 'Contraseña de usuario' })
	password: string;
}

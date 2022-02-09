import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
	@Field({ description: 'Nombre del usuario' })
	name: string;

	@Field({ description: 'Usuario registrado' })
	username: string;

	@Field({ description: 'Contraseña de usuario' })
	password: string;

	@Field({ description: 'Rol asignado al usuario' })
	role: string;
}

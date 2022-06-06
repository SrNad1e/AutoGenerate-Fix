import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '../entities/user.entity';

@ObjectType({ description: 'Respuesta despues de hacer el login' })
export class LoginResponse {
	@Field(() => String, { description: 'Token para la conexión' })
	access_token: string;

	@Field(() => User, { description: 'Usuario almacenado en la base de datos' })
	user: User;
}

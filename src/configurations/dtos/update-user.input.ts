import { Field, InputType, PartialType } from '@nestjs/graphql';
import { StatusUser } from '../entities/user.entity';

import { CreateUserInput } from './create-user.input';

@InputType({ description: 'Datos para actualizar el usuario' })
export class UpdateUserInput extends PartialType(CreateUserInput) {
	@Field(() => StatusUser, {
		description: 'Estado del usuario',
		nullable: true,
	})
	status?: StatusUser;
}

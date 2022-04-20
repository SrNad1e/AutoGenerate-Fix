import { Field, InputType, PartialType } from '@nestjs/graphql';

import { CreateUserInput } from './create-user.input';

@InputType({ description: 'Datos para actualizar el usuario' })
export class UpdateUserInput extends PartialType(CreateUserInput) {
	@Field(() => String, { description: 'Estado del usuario', nullable: true })
	status: string;
}

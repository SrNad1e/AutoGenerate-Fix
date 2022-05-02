import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Filtros para consultar un usuario' })
export class FiltersUserInput {
	@Field(() => String, {
		description: 'Nombre de usuario del usuario',
		nullable: true,
	})
	username?: string;

	@Field(() => String, {
		description: 'Identificador del cliente',
		nullable: true,
	})
	customerId?: string;
}

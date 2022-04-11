import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
	@Field({ description: 'Nombre del usuario' })
	name: string;

	@Field({ description: 'Usuario registrado' })
	username: string;

	@Field({ description: 'Contraseña de usuario' })
	password: string;

	@Field({ description: 'Identificador del roll del usuario' })
	role: string;

	@Field(() => String, {
		description: 'Identificador del tipo de cliente',
	})
	customerType: string;

	@Field(() => String, {
		description: 'Identificador de la tienda asignada al usuario',
	})
	shop: string;

	@Field(() => String, {
		description: 'Identificador del punto de venta asignado al usuario',
		nullable: true,
	})
	pointOfSale: string;

	@Field(() => String, {
		description: 'Identificador de la empresa a la que pertenece el usuario',
	})
	company: string;
}

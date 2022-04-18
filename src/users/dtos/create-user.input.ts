import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de un usuario' })
export class CreateUserInput {
	@Field({ description: 'Nombre del usuario' })
	name: string;

	@Field({ description: 'Usuario registrado' })
	username: string;

	@Field({ description: 'Contraseña de usuario' })
	password: string;

	@Field({ description: 'Identificador del rol del usuario' })
	role: string;

	@Field(() => String, {
		description: 'Identificador del tipo de cliente',
		nullable: true,
	})
	customerTypeId: string;

	@Field(() => String, {
		description: 'Identificador de la tienda asignada al usuario',
	})
	shopId: string;

	@Field(() => String, {
		description: 'Identificador del punto de venta asignado al usuario',
		nullable: true,
	})
	pointOfSaleId: string;

	@Field(() => String, {
		description: 'Identificador de la empresa a la que pertenece el usuario',
	})
	companyId: string;
}

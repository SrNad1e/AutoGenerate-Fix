import { Field, InputType } from '@nestjs/graphql';
import { StatusUser } from '../entities/user.entity';

@InputType({ description: 'Datos para la creación de un usuario' })
export class CreateUserInput {
	@Field({ description: 'Nombre del usuario' })
	name: string;

	@Field({ description: 'Usuario registrado', nullable: true })
	username?: string;

	@Field({ description: 'Contraseña de usuario', nullable: true })
	password?: string;

	@Field({ description: 'Identificador del rol del usuario' })
	roleId: string;

	@Field(() => String, {
		description: 'Identificador de la tienda asignada al usuario',
	})
	shopId: string;

	@Field(() => String, {
		description: 'Identificador del cliente asignado al usuario',
		nullable: true,
	})
	customerId?: string;

	@Field(() => String, {
		description: 'Identificador del punto de venta asignado al usuario',
		nullable: true,
	})
	pointOfSaleId?: string;

	/*@Field(() => String, {
		description: 'Identificador de la empresa a la que pertenece el usuario',
		nullable: true,
	})
	companyId?: string;*/

	@Field(() => StatusUser, {
		description: 'Estado del usuario',
		nullable: true,
	})
	status?: StatusUser;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para el registro de un usuario' })
export class SignUpInput {
	@Field(() => String, { description: 'Nombres del cliente' })
	firstName: string;

	@Field(() => String, { description: 'Apellidos del cliente' })
	lastName: string;

	@Field(() => String, { description: 'Documento de identidad del cliente' })
	document: string;

	@Field(() => String, { description: 'Teléfono del cliente', nullable: true })
	phone?: string;

	@Field(() => String, {
		description: 'Fecha de cumpleaños del cliente',
		nullable: true,
	})
	birthDate?: Date;

	@Field(() => String, { description: 'Correo del cliente' })
	email: string;

	@Field(() => String, { description: 'Contraseña del cliente' })
	password: string;
}

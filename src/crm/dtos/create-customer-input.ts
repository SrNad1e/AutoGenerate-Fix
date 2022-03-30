import { Field, InputType } from '@nestjs/graphql';
import { Address } from '../entities/customer.entity';

@InputType()
export class CreateCustomerInput {
	@Field(() => String, { description: 'Identificación del tipo de documento' })
	documentTypeId: string;

	@Field(() => String, { description: 'Número de documento' })
	document: string;

	@Field(() => String, { description: 'Nombres del cliente' })
	firstName: string;

	@Field(() => String, { description: 'Apellidos del cliente' })
	lastName: string;

	@Field(() => Address, {
		description: 'Dirección del cliente',
		nullable: true,
	})
	direction: Address;

	@Field(() => String, {
		description: 'Identificación de tipo de cliente',
		nullable: true,
	})
	customerTypeId: string;

	@Field(() => Number, { description: 'Número de teléfono', nullable: true })
	phone: number;

	@Field(() => Boolean, {
		description: 'El teléfono tiene whatsapp',
		nullable: true,
	})
	isWhatsapp: boolean;

	@Field(() => String, {
		description: 'Correo del cliente',
		nullable: true,
	})
	email: string;

	@Field(() => Boolean, {
		description: 'Es el cliente por defecto, solo debe existir uno',
		nullable: true,
	})
	isDefault: boolean;

	@Field(() => String, {
		description: 'Id del usuario asignado',
		nullable: true,
	})
	assigningUser: string;

	@Field(() => Date, {
		description: 'Fecha de nacimiento',
		nullable: true,
	})
	birthday: Date;
}

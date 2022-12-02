import { Field, InputType } from '@nestjs/graphql';
import { AddressInput } from './create-customer.input';

@InputType({ description: 'Datos para actualizar un cliente' })
export class UpdateCustomerInput {
	@Field(() => String, {
		description: 'Identificación del tipo de documento',
		nullable: true,
	})
	documentTypeId?: string;

	@Field(() => String, { description: 'Número de documento', nullable: true })
	document?: string;

	@Field(() => String, { description: 'Nombres del cliente', nullable: true })
	firstName?: string;

	@Field(() => Boolean, { description: 'Cliente activo', nullable: true })
	active?: boolean;

	@Field(() => String, { description: 'Apellidos del cliente', nullable: true })
	lastName?: string;

	@Field(() => [AddressInput], {
		description: 'Direcciones del cliente',
		nullable: true,
	})
	addresses?: AddressInput[];

	@Field(() => String, {
		description: 'Identificación de tipo de cliente',
		nullable: true,
	})
	customerTypeId?: string;

	@Field(() => String, { description: 'Número de teléfono', nullable: true })
	phone?: string;

	@Field(() => Boolean, {
		description: 'El teléfono tiene whatsapp',
		nullable: true,
	})
	isWhatsapp?: boolean;

	@Field(() => String, {
		description: 'Correo del cliente',
		nullable: true,
	})
	email?: string;

	@Field(() => Boolean, {
		description: 'Es el cliente por defecto, solo debe existir uno',
		nullable: true,
	})
	isDefault?: boolean;

	@Field(() => Date, {
		description: 'Fecha de nacimiento',
		nullable: true,
	})
	birthday?: Date;
}

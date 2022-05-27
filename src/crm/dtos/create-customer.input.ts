import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Dirección del cliente' })
export class AddressInput {
	@Field(() => String, {
		description: 'Tipo de ubicación (Calle, Avenida, Manzana, Etc)',
	})
	field1: string;

	@Field(() => String, {
		description: 'Número del field1',
	})
	number1: string;

	@Field(() => String, {
		description: 'Número del field2',
	})
	number2: string;

	@Field(() => String, {
		description: 'Número de la casa',
	})
	loteNumber: string;

	@Field(() => String, {
		description: 'Datos extra de la dirección',
		nullable: true,
	})
	extra?: string;

	@Field(() => String, {
		description: 'Barrio',
	})
	neighborhood: string;

	@Field(() => String, { description: 'Identificador de la ciudad' })
	cityId: string;

	@Field(() => String, { description: 'Contacto para el envío' })
	contact: string;

	@Field(() => String, { description: 'Teléfono del contacto' })
	phone: string;

	@Field(() => Boolean, {
		description: 'Define si la dirección es la principal',
		nullable: true,
	})
	isMain: boolean;
}

@InputType({ description: 'Datos para crear un cliente' })
export class CreateCustomerInput {
	@Field(() => String, { description: 'Identificación del tipo de documento' })
	documentTypeId: string;

	@Field(() => String, { description: 'Número de documento' })
	document: string;

	@Field(() => String, { description: 'Nombres del cliente' })
	firstName: string;

	@Field(() => String, { description: 'Apellidos del cliente' })
	lastName: string;

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

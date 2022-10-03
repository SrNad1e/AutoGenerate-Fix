import { Field, InputType } from '@nestjs/graphql';
import { StatusOrder } from '../entities/order.entity';
import { StatusWeb } from '../entities/status-web-history';

@InputType({ description: 'País entrada' })
export class CountryInput {
	@Field(() => String, { description: 'Nombre del país' })
	name: string;
}

@InputType({ description: 'Ciudad entrada' })
export class CityInput {
	@Field(() => String, { description: 'Identificador de mongo' })
	_id: string;

	@Field(() => String, { description: 'Nombre de la ciudad' })
	name: string;

	@Field(() => String, { description: 'Departamento' })
	state: string;

	@Field(() => CountryInput, { description: 'País' })
	country: CountryInput;

	@Field(() => Date, { description: 'Fecha de creación', nullable: true })
	createdAt?: Date;

	@Field(() => Date, { description: 'Fecha de actualización', nullable: true })
	updatedAt?: Date;
}

@InputType({ description: 'Dirección del cliente' })
export class AddressInputOrder {
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

	@Field(() => CityInput, { description: 'Ciudad de envío' })
	city: CityInput;

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

@InputType({ description: 'Datos para actualizar el pedido' })
export class UpdateOrderInput {
	@Field(() => StatusOrder, {
		description: 'Estado del pedido',
		nullable: true,
	})
	status?: StatusOrder;

	@Field(() => String, {
		description: 'Identificación del cliente',
		nullable: true,
	})
	customerId?: string;

	@Field(() => String, {
		description: 'Identificación de la transportadora',
		nullable: true,
	})
	conveyorId?: string;

	@Field(() => AddressInputOrder, {
		description: 'Dirección de envío para el pedido',
		nullable: true,
	})
	address?: AddressInputOrder;

	@Field(() => StatusWeb, {
		description: 'Estado que se aplicará al pedid web',
		nullable: true,
	})
	statusWeb?: StatusWeb;
}

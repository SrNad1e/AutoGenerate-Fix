import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento del cliente' })
export class SortCustomer {
	@Field(() => Number, {
		description: 'ordernamiento por documento',
		nullable: true,
	})
	document: number;

	@Field(() => Number, {
		description: 'ordernamiento por nombre',
		nullable: true,
	})
	firstName: number;

	@Field(() => Number, {
		description: 'ordernamiento por apellido',
		nullable: true,
	})
	lastName: number;

	@Field(() => Number, {
		description: 'ordernamiento por teléfono',
		nullable: true,
	})
	phone: number;

	@Field(() => Number, {
		description: 'ordernamiento por si tiene whatsapp',
		nullable: true,
	})
	isWhatsapp: number;

	@Field(() => Number, {
		description: 'ordernamiento por correo',
		nullable: true,
	})
	email: number;

	@Field(() => Number, {
		description: 'ordernamiento por si es por defecto',
		nullable: true,
	})
	isDefault: number;

	@Field(() => Number, {
		description: 'ordernamiento por estado del cliente',
		nullable: true,
	})
	active: number;
}

@InputType({ description: 'Filtros de listado de clientes' })
export class FiltersCustomersInput {
	@Field(() => String, {
		description:
			'comodin para la busque de documento, nombre, apellido, teléfono, correo, ',
		nullable: true,
	})
	dato: string;

	@Field(() => String, {
		description: 'Identificdor de un usuario',
		nullable: true,
	})
	_id?: string;

	@Field(() => SortCustomer, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortCustomer;

	@Field(() => Boolean, {
		description: 'Si el cliente se encuentra activo',
		nullable: true,
	})
	active: boolean;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

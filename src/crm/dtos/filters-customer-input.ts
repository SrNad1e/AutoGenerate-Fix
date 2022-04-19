import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento del cliente' })
export class SortCustomer {
	@Field(() => Number, { description: 'ordernamiento por documento' })
	document: number;

	@Field(() => Number, { description: 'ordernamiento por nombre' })
	firstName: number;

	@Field(() => Number, { description: 'ordernamiento por apellido' })
	lastName: number;

	@Field(() => Number, { description: 'ordernamiento por docuemnto' })
	phone: number;

	@Field(() => Number, { description: 'ordernamiento por docuemnto' })
	isWhatsapp: number;

	@Field(() => Number, { description: 'ordernamiento por docuemnto' })
	email: number;

	@Field(() => Number, { description: 'ordernamiento por docuemnto' })
	isDefault: number;

	@Field(() => Number, { description: 'ordernamiento por docuemnto' })
	active: number;
}

@InputType({ description: 'Filtros de listado de clientes' })
export class FiltersCustomerInput {
	@Field(() => String, {
		description:
			'comodin para la busque de documento, nombre, apellido, teléfono, correo, ',
		nullable: true,
	})
	dato: string;

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

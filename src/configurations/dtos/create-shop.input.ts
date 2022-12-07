import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de la tienda' })
export class CreateShopInput {
	@Field(() => String, { description: 'Nombre de la tienda' })
	name: string;

	@Field(() => String, {
		description: 'Documento de la tienda',
		nullable: true,
	})
	document?: string;

	@Field(() => String, {
		description: 'Email de la tienda',
		nullable: true,
	})
	email?: string;

	@Field(() => String, {
		description: 'Nombre comercial de la tienda',
		nullable: true,
	})
	companyName?: string;

	@Field(() => String, { description: 'Dirección de la tienda' })
	address: string;

	@Field(() => String, { description: 'Teléfono de la tienda', nullable: true })
	phone: string;

	@Field(() => Number, {
		description: 'Meta asiganda a la tienda',
		nullable: true,
	})
	goal?: number;

	@Field(() => String, {
		description: 'Identificador de la bodega predeterminada para la tienda',
	})
	defaultWarehouseId: string;

	@Field(() => Boolean, {
		description: 'Es centro de distribución',
		nullable: true,
	})
	isMain?: boolean;

	@Field(() => String, {
		description:
			'Identificador de la bodega de centro de distribución asignado',
		nullable: true,
	})
	warehouseMainId?: string;
}

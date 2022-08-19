import { Field, InputType } from '@nestjs/graphql';
import { StatusOrder } from '../entities/order.entity';
import { StatusWeb } from '../entities/status-web-history';

@InputType({ description: 'Ordenamiento de pedidos' })
export class SortOrder {
	@Field(() => Number, {
		description: 'Ordenamiento por número consecutivo del pedido',
		nullable: true,
	})
	number: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de actualización',
		nullable: true,
	})
	updatedAt: number;
}

@InputType({ description: 'Filtros del listado de pedidos' })
export class FiltersOrdersInput {
	@Field(() => SortOrder, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortOrder;

	@Field(() => Number, {
		description: 'Número consecutivo del pedido',
		nullable: true,
	})
	number: number;

	@Field(() => String, {
		description: 'Identificador del cliente',
		nullable: true,
	})
	customerId?: string;

	@Field(() => String, {
		description: 'Identificador del medio de pago',
		nullable: true,
	})
	paymentId?: string;

	@Field(() => String, {
		description: 'Fecha inicial para la busqueda',
		nullable: true,
	})
	dateInitial: string;

	@Field(() => String, {
		description: 'Fecha final para la busqueda',
		nullable: true,
	})
	dateFinal: string;

	@Field(() => StatusOrder, {
		description: 'Estado del pedido',
		nullable: true,
	})
	status?: StatusOrder;

	@Field(() => StatusWeb, {
		description: 'Estado del pedido Web',
		nullable: true,
	})
	statusWeb?: StatusWeb;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field({ description: 'Trae los pedidos POS solamente', nullable: true })
	orderPos?: boolean;
}

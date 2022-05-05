import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType({ description: 'Ordenamiento del solicitudes de productos' })
export class SortStockRequest {
	@Field(() => Number, {
		description: 'Ordenamiento por número',
		nullable: true,
	})
	number: number;

	@Field(() => Number, {
		description: 'Ordenamiento por estado',
		nullable: true,
	})
	status: number;

	@Field(() => Number, {
		description: 'Ordenamiento por bodega de destino',
		nullable: true,
	})
	warehouseDestination: number;

	@Field(() => Number, {
		description: 'Ordenamiento por bodega de origen',
		nullable: true,
	})
	warehouseOrigin: number;

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

@InputType({
	description: 'Filtros para el listado de solicitudes de productos',
})
export class FiltersStockRequestsInput {
	@Field(() => Number, {
		description: 'Número consecutivo asignado al traslado',
		nullable: true,
	})
	number: number;

	@Field(() => String, {
		description: 'Estado de la solicitud (open, pending, cancelled, used)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Id de la bodega de origen',
		nullable: true,
	})
	warehouseOriginId: Types.ObjectId;

	@Field(() => String, {
		description: 'Id de la bodega de destino',
		nullable: true,
	})
	warehouseDestinationId: Types.ObjectId;

	@Field(() => SortStockRequest, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortStockRequest;

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

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

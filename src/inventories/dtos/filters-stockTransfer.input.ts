import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class SortStockTransfer {
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

@InputType()
export class FiltersStockTransferInput {
	@Field(() => Number, {
		description: 'Número consecutivo asignado al traslado',
		nullable: true,
	})
	number: number;

	@Field(() => String, {
		description:
			'Estado del traslado (open, sent, confirmed, incomplete, cancelled)',
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

	@Field(() => SortStockTransfer, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortStockTransfer;

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

import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { DetailStockTransferInput } from './update-stockTransfer-input';

@InputType()
export class CreateStockTransferInput {
	@Field(() => String, {
		description: 'Identificador de la bodega de origen del traslado',
	})
	warehouseOriginId: Types.ObjectId;

	@Field(() => String, {
		description: 'Identificador de la bodega de destino del traslado',
	})
	warehouseDestinationId: Types.ObjectId;

	@Field(() => String, {
		description:
			'Estado del traslado (open, sent, confirmed, incomplete, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => [DetailStockTransferInput], {
		description: 'Productos del traslado',
	})
	details: DetailStockTransferInput[];

	@Field(() => String, {
		description: 'Observación del que realiza el traslado',
		nullable: true,
	})
	observationOrigin: string;

	@Field(() => [String], {
		description: 'Solicitudes usadas',
		nullable: true,
	})
	requests: string[];
}

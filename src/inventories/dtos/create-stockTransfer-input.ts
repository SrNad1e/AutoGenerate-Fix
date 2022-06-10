import { Field, InputType } from '@nestjs/graphql';
import { StatusStockTransfer } from '../entities/stock-transfer.entity';

@InputType({ description: 'Productos para marcar agregados para el historial' })
export class CreateStockTransferInput {
	@Field(() => String, {
		description: 'Identificador de la bodega de origen del traslado',
	})
	warehouseOriginId: string;

	@Field(() => String, {
		description: 'Identificador de la bodega de destino del traslado',
	})
	warehouseDestinationId: string;

	@Field(() => StatusStockTransfer, {
		description: 'Estado del traslado',
		nullable: true,
	})
	status?: StatusStockTransfer;

	@Field(() => [DetailStockTransferCreateInput], {
		description: 'Productos del traslado',
	})
	details: DetailStockTransferCreateInput[];

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

@InputType({ description: 'Productos del historial de inventario' })
export class DetailStockTransferCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStockTransferInput {
	@Field(() => String, {
		description: 'Identificador de la bodega de origen del traslado',
	})
	warehouseOriginId: string;

	@Field(() => String, {
		description: 'Identificador de la bodega de destino del traslado',
	})
	warehouseDestinationId: string;

	@Field(() => String, {
		description:
			'Estado del traslado (open, sent, confirmed, incomplete, cancelled)',
		nullable: true,
	})
	status: string;

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

@InputType()
export class DetailStockTransferCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

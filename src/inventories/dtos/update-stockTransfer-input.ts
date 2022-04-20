import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Detalle del traslado de productos' })
export class DetailStockTransferInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => String, {
		description: 'Acción a efectuar con el producto (delete, update, create)',
	})
	action: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para actualizar el traslado de productos' })
export class UpdateStockTransferInput {
	@Field(() => [DetailStockTransferInput], {
		description: 'Productos del traslado',
		nullable: true,
	})
	details: DetailStockTransferInput[];

	@Field(() => String, {
		description:
			'Estado del traslado (open, sent, confirmed, incomplete, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Observación del que envía el traslado',
		nullable: true,
	})
	observationOrigin: string;

	@Field(() => String, {
		description: 'Observación del que recibe el traslado',
		nullable: true,
	})
	observationDestination: string;

	@Field(() => String, {
		description: 'Observación general',
		nullable: true,
	})
	observation: string;

	@Field(() => [String], {
		description: 'Solicitudes usadas',
		nullable: true,
	})
	requests: string[];
}

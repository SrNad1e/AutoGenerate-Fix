import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { StatusStockTransfer } from '../entities/stock-transfer.entity';

export enum ActionDetailTransfer {
	DELETE = 'delete',
	UPDATE = 'update',
	CREATE = 'create',
}

registerEnumType(ActionDetailTransfer, { name: 'ActionDetailTransfer' });

@InputType({ description: 'Detalle del traslado de productos' })
export class DetailStockTransferInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => ActionDetailTransfer, {
		description: 'Acción a efectuar con el producto',
	})
	action: ActionDetailTransfer;

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

	@Field(() => StatusStockTransfer, {
		description: 'Estado del traslado',
		nullable: true,
	})
	status: StatusStockTransfer;

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

import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { StatusStockAdjustment } from '../entities/stock-adjustment.entity';

export enum ActionDetailAdjustment {
	DELETE = 'delete',
	UPDATE = 'update',
	CREATE = 'create',
}

registerEnumType(ActionDetailAdjustment, { name: 'ActionDetailAdjustment' });

@InputType({ description: 'Detalle del ajuste de productos' })
export class DetailStockAdjustmentInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => String, {
		description: 'Acción a efectuar con el producto',
	})
	action: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para actualizar el ajuste de productos' })
export class UpdateStockAdjustmentInput {
	@Field(() => [DetailStockAdjustmentInput], {
		description: 'Productos del ajuste',
		nullable: true,
	})
	details: DetailStockAdjustmentInput[];

	@Field(() => StatusStockAdjustment, {
		description: 'Estado del ajuste',
		nullable: true,
	})
	status: StatusStockAdjustment;

	@Field(() => String, {
		description: 'Observación del ajuste',
		nullable: true,
	})
	observation: string;
}

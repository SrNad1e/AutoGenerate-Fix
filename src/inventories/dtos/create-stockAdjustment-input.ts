import { Field, InputType } from '@nestjs/graphql';
import { StatusStockAdjustment } from '../entities/stock-adjustment.entity';

@InputType({ description: 'Productos del ajuste de productos' })
export class DetailStockAdjustmentCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para crear el ajuste de productos' })
export class CreateStockAdjustmentInput {
	@Field(() => String, {
		description: 'Identificador de la bodega para el ajuste',
	})
	warehouseId: string;

	@Field(() => StatusStockAdjustment, {
		description: 'Estado del ajuste',
		nullable: true,
	})
	status: StatusStockAdjustment;

	@Field(() => [DetailStockAdjustmentCreateInput], {
		description: 'Productos del ajuste',
	})
	details: DetailStockAdjustmentCreateInput[];

	@Field(() => String, {
		description: 'Observación del que realiza el ajuste',
		nullable: true,
	})
	observation: string;
}

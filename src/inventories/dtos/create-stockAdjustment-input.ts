import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStockAdjustmentInput {
	@Field(() => String, {
		description: 'Identificador de la bodega para el ajuste',
	})
	warehouseId: string;

	@Field(() => String, {
		description: 'Estado del ajuste (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

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

@InputType()
export class DetailStockAdjustmentCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

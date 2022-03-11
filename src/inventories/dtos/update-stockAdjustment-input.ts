import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateStockAdjustmentInput {
	@Field(() => [DetailStockAdjustmentInput], {
		description: 'Productos del ajuste',
		nullable: true,
	})
	details: DetailStockAdjustmentInput[];

	@Field(() => String, {
		description: 'Estado del ajuste (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Observación del ajuste',
		nullable: true,
	})
	observation: string;
}

@InputType()
export class DetailStockAdjustmentInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => String, {
		description: 'Acción a efectuar con el producto (delete, update, create)',
	})
	action: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

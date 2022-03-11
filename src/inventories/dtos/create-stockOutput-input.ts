import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStockOutputInput {
	@Field(() => String, {
		description: 'Identificador de la bodega para la salida',
	})
	warehouseId: string;

	@Field(() => String, {
		description: 'Estado de la salida (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => [DetailStockInputCreateInput], {
		description: 'Productos de la salida',
	})
	details: DetailStockInputCreateInput[];

	@Field(() => String, {
		description: 'Observación del que realiza la salida',
		nullable: true,
	})
	observation: string;
}

@InputType()
export class DetailStockInputCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

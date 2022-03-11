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

	@Field(() => [DetailStockOutputCreateInput], {
		description: 'Productos de la salida',
	})
	details: DetailStockOutputCreateInput[];

	@Field(() => String, {
		description: 'Observación del que realiza la salida',
		nullable: true,
	})
	observation: string;
}

@InputType()
export class DetailStockOutputCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateStockOutputnput {
	@Field(() => [DetailStockOutputInput], {
		description: 'Productos de la salida',
		nullable: true,
	})
	details: DetailStockOutputInput[];

	@Field(() => String, {
		description: 'Estado de la salida (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Observación de la salida',
		nullable: true,
	})
	observation: string;
}

@InputType()
export class DetailStockOutputInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => String, {
		description: 'Acción a efectuar con el producto (delete, update, create)',
	})
	action: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Detalle de la entrada de productos' })
export class DetailStockInputInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => String, {
		description: 'Acción a efectuar con el producto (delete, update, create)',
	})
	action: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para actualizar la entrada de productos' })
export class UpdateStockInputInput {
	@Field(() => [DetailStockInputInput], {
		description: 'Productos de la entrada',
		nullable: true,
	})
	details: DetailStockInputInput[];

	@Field(() => String, {
		description: 'Estado de la entrada (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Observación de la entrada',
		nullable: true,
	})
	observation: string;
}

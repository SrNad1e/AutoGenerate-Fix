import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStockInputInput {
	@Field(() => String, {
		description: 'Identificador de la bodega para la entrada',
	})
	warehouseId: string;

	@Field(() => String, {
		description: 'Estado de la entrada (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => [DetailStockInputCreateInput], {
		description: 'Productos de la solicitud',
	})
	details: DetailStockInputCreateInput[];

	@Field(() => String, {
		description: 'Observación del que realiza la entrada',
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

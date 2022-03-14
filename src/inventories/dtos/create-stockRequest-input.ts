import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateStockRequestInput {
	@Field(() => String, {
		description: 'Identificador de la bodega de origen de la solicitud',
	})
	warehouseOriginId: string;

	@Field(() => String, {
		description: 'Identificador de la bodega de destino de la solicitud',
	})
	warehouseDestinationId: string;

	@Field(() => String, {
		description: 'Estado de la solicitud (open, pending, used, cancelled )',
		nullable: true,
	})
	status?: string;

	@Field(() => [DetailStockRequestCreateInput], {
		description: 'Productos de la solicitud',
	})
	details: DetailStockRequestCreateInput[];

	@Field(() => String, {
		description: 'Observación de la solicitud',
		nullable: true,
	})
	observation?: string;
}

@InputType()
export class DetailStockRequestCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

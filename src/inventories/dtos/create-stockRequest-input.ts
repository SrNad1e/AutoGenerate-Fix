import { Field, InputType } from '@nestjs/graphql';
import { StatusStockRequest } from '../entities/stock-request.entity';

@InputType({ description: 'Productos de la solicitud de productos' })
export class DetailStockRequestCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para crear la solicitud de productos' })
export class CreateStockRequestInput {
	@Field(() => String, {
		description: 'Identificador de la bodega de origen de la solicitud',
	})
	warehouseOriginId: string;

	@Field(() => String, {
		description: 'Identificador de la bodega de destino de la solicitud',
	})
	warehouseDestinationId: string;

	@Field(() => StatusStockRequest, {
		description: 'Estado de la solicitud',
		nullable: true,
	})
	status?: StatusStockRequest;

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

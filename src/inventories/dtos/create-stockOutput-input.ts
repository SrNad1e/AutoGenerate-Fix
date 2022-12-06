import { Field, InputType } from '@nestjs/graphql';
import { StatusStockOutput } from '../entities/stock-output.entity';

@InputType({ description: 'Productos de la salida de productos' })
export class DetailStockOutputCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para crear la salida de productos' })
export class CreateStockOutputInput {
	@Field(() => String, {
		description: 'Identificador de la bodega para la salida',
	})
	warehouseId: string;

	@Field(() => StatusStockOutput, {
		description: 'Estado de la salida',
		nullable: true,
	})
	status: StatusStockOutput;

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

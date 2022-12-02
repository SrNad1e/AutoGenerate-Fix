import { Field, InputType } from '@nestjs/graphql';
import { StatusStockInput } from '../entities/stock-input.entity';

@InputType({ description: 'Productos de la entrada de productos' })
export class DetailStockInputCreateInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para crear la entrada de productos' })
export class CreateStockInputInput {
	@Field(() => String, {
		description: 'Identificador de la bodega para la entrada',
	})
	warehouseId: string;

	@Field(() => StatusStockInput, {
		description: 'Estado de la entrada',
		nullable: true,
	})
	status: StatusStockInput;

	@Field(() => [DetailStockInputCreateInput], {
		description: 'Productos de la entrada',
	})
	details: DetailStockInputCreateInput[];

	@Field(() => String, {
		description: 'Observación del que realiza la entrada',
		nullable: true,
	})
	observation: string;
}

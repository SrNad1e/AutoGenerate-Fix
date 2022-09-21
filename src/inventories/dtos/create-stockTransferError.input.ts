import { Field, InputType } from '@nestjs/graphql';
import { Product } from 'src/products/entities/product.entity';
import { StatusDetailTransferError } from '../entities/stock-trasnsfer-error.entity';

@InputType({ description: 'Datos para la creación de un registro de traslado' })
export class CreateStockTransferError {
	@Field(() => String, {
		description: 'Identificador del traslado con errores',
	})
	stockTransferId: string;

	@Field(() => [DetailsStockTransferErrorCreateInput], {
		description: 'Productos con errores',
	})
	details: DetailsStockTransferErrorCreateInput[];
}

@InputType({ description: 'Productos con error en el traslado' })
export class DetailsStockTransferErrorCreateInput {
	@Field(() => Product, { description: 'Productos de el traslado' })
	product: Product;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;

	@Field(() => StatusDetailTransferError, {
		description: 'Estado del producto',
	})
	status: StatusDetailTransferError;
}

import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { StatusStockOutput } from '../entities/stock-output.entity';

export enum ActionDetailOutput {
	DELETE = 'delete',
	UPDATE = 'update',
	CREATE = 'create',
}

registerEnumType(ActionDetailOutput, { name: 'ActionDetailOutput' });

@InputType({ description: 'Detalle de la salida de productos' })
export class DetailStockOutputInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => ActionDetailOutput, {
		description: 'Acción a efectuar con el producto',
	})
	action: ActionDetailOutput;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para actualizar la salida de productos' })
export class UpdateStockOutputInput {
	@Field(() => [DetailStockOutputInput], {
		description: 'Productos de la salida',
		nullable: true,
	})
	details: DetailStockOutputInput[];

	@Field(() => StatusStockOutput, {
		description: 'Estado de la salida',
		nullable: true,
	})
	status: StatusStockOutput;

	@Field(() => String, {
		description: 'Observación de la salida',
		nullable: true,
	})
	observation: string;
}

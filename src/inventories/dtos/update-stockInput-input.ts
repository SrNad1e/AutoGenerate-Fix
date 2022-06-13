import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { StatusStockInput } from '../entities/stock-input.entity';

export enum ActionDetailInput {
	DELETE = 'delete',
	UPDATE = 'update',
	CREATE = 'create',
}

registerEnumType(ActionDetailInput, { name: 'ActionDetailInput' });

@InputType({ description: 'Detalle de la entrada de productos' })
export class DetailStockInputInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => ActionDetailInput, {
		description: 'Acción a efectuar con el producto',
	})
	action: ActionDetailInput;

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

	@Field(() => StatusStockInput, {
		description: 'Estado de la entrada',
		nullable: true,
	})
	status: StatusStockInput;

	@Field(() => String, {
		description: 'Observación de la entrada',
		nullable: true,
	})
	observation: string;
}

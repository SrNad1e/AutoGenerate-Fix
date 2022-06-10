import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { StatusStockRequest } from '../entities/stock-request.entity';

export enum ActionDetailRequest {
	DELETE = 'delete',
	UPDATE = 'update',
	CREATE = 'create',
}

registerEnumType(ActionDetailRequest, { name: 'ActionDetailRequest' });

@InputType({ description: 'Detalle de la solicitud de productos' })
export class DetailStockRequestInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: string;

	@Field(() => ActionDetailRequest, {
		description: 'Acción a efectuar con el producto',
	})
	action: ActionDetailRequest;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

@InputType({ description: 'Datos para actualizar la solicitud de productos' })
export class UpdateStockRequestInput {
	@Field(() => [DetailStockRequestInput], {
		description: 'Productos de la solicitud',
		nullable: true,
	})
	details: DetailStockRequestInput[];

	@Field(() => StatusStockRequest, {
		description: 'Estado de la solicitud',
		nullable: true,
	})
	status: StatusStockRequest;

	@Field(() => String, {
		description: 'Observación de la solicitud',
		nullable: true,
	})
	observation: string;
}

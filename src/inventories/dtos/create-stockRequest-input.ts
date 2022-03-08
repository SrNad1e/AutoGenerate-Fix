import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { DetailStockRequestInput } from './update-stockRequest-input';

@InputType()
export class CreateStockRequestInput {
	@Field(() => String, {
		description: 'Identificador de la bodega de origen de la solicitud',
	})
	warehouseOriginId: Types.ObjectId;

	@Field(() => String, {
		description: 'Identificador de la bodega de destino de la solicitud',
	})
	warehouseDestinationId: Types.ObjectId;

	@Field(() => String, {
		description: 'Estado de la solicitud (open, pending, used, cancelled )',
		nullable: true,
	})
	status: string;

	@Field(() => [DetailStockRequestInput], {
		description: 'Productos de la solicitud',
	})
	details: DetailStockRequestInput[];

	@Field(() => String, {
		description: 'Observación de la solicitud',
		nullable: true,
	})
	observation: string;
}

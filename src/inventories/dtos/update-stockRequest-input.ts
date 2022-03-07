import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class UpdateStockRequestInput {
	@Field(() => [DetailStockRequestInput], {
		description: 'Productos de la solicitud',
		nullable: true,
	})
	details: DetailStockRequestInput[];

	@Field(() => String, {
		description: 'Estado de la solicitud (open, pending, used, canceled )',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Observación de la solicitud',
		nullable: true,
	})
	observation: string;
}

@InputType()
export class DetailStockRequestInput {
	@Field(() => String, { description: 'Identificador de mongo del producto' })
	productId: Types.ObjectId;

	@Field(() => String, {
		description: 'Acción a efectuar con el producto (delete, update, create)',
		nullable: true,
	})
	action: string;

	@Field(() => Number, { description: 'Cantidad de productos' })
	quantity: number;
}

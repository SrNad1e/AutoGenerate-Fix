import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersStockTransferInput {
	@Field(() => Number, { description: 'Número del traslado', nullable: true })
	number?: number;

	@Field({ description: 'Número del traslado', nullable: true })
	limit?: number;

	@Field({ description: 'Número del traslado', nullable: true })
	skip?: number;

	@Field({ description: 'Número del traslado', nullable: true })
	warehouseDestinationId?: number;

	@Field({ description: 'Número del traslado', nullable: true })
	warehouseOriginId?: number;

	@Field({ description: 'Número del traslado', nullable: true })
	shopId?: number;

	@Field({ description: 'Número del traslado', nullable: true })
	status?: string;

	@Field({ description: 'Número del traslado', nullable: true })
	createdAtMin?: Date;

	@Field({ description: 'Número del traslado', nullable: true })
	createdAtMax?: Date;

	/*@Field(() => raw, { description: 'Número del traslado', nullable: true })
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;*/
}

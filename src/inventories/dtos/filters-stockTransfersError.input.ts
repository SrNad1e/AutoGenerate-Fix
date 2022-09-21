import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType({ description: 'Ordenamiento del traslado de productos' })
export class SortStockTransferError {
	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de actualización',
		nullable: true,
	})
	updatedAt: number;
}

@InputType({ description: 'Filtros para el listado de traslados de productos' })
export class FiltersStockTransfersErrorInput {
	@Field(() => Boolean, {
		description: 'Si el traslado esta o no verificado por completo',
		nullable: true,
	})
	verifield?: boolean;

	@Field(() => SortStockTransferError, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort?: SortStockTransferError;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

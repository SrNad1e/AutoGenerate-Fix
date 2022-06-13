import { Field, InputType } from '@nestjs/graphql';
import { StatusStockAdjustment } from '../entities/stock-adjustment.entity';

@InputType({ description: 'Ordenamiento del ajuste de productos' })
export class SortStockAdjustment {
	@Field(() => Number, {
		description: 'Ordenamiento por número',
		nullable: true,
	})
	number: number;

	@Field(() => Number, {
		description: 'Ordenamiento por estado',
		nullable: true,
	})
	status: number;

	@Field(() => Number, {
		description: 'Ordenamiento por bodega',
		nullable: true,
	})
	warehouse: number;

	@Field(() => Number, {
		description: 'Ordenamiento por total',
		nullable: true,
	})
	total: number;

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

@InputType({ description: 'Filtros para el listado de ajsutes de productos' })
export class FiltersStockAdjustmentsInput {
	@Field(() => Number, {
		description: 'Número consecutivo asignado al ajuste',
		nullable: true,
	})
	number: number;

	@Field(() => StatusStockAdjustment, {
		description: 'Estado del ajuste',
		nullable: true,
	})
	status: StatusStockAdjustment;

	@Field(() => String, {
		description: 'Id de la bodega',
		nullable: true,
	})
	warehouseId: string;

	@Field(() => SortStockAdjustment, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortStockAdjustment;

	@Field(() => Number, {
		description: 'Valor total de la entrada',
		nullable: true,
	})
	total: number;

	@Field(() => String, {
		description: 'Fecha inicial para la busqueda',
		nullable: true,
	})
	dateInitial: string;

	@Field(() => String, {
		description: 'Fecha final para la busqueda',
		nullable: true,
	})
	dateFinal: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

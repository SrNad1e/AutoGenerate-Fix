import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortStockOutput {
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
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de actualización',
		nullable: true,
	})
	updateAt: number;
}

@InputType()
export class FiltersStockOutputInput {
	@Field(() => Number, {
		description: 'Número consecutivo asignado a la salida',
		nullable: true,
	})
	number: number;

	@Field(() => String, {
		description: 'Estado de la salida (open, confirmed, cancelled)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Id de la bodega',
		nullable: true,
	})
	warehouseId: string;

	@Field(() => SortStockOutput, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortStockOutput;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;
}

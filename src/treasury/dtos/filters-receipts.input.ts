import { Field, InputType } from '@nestjs/graphql';
import { StatusReceipt } from '../entities/receipt.entity';

@InputType({ description: 'Ordenamiento de los recibos de caja' })
export class SortReceipt {
	@Field(() => Number, {
		description: 'Ordenamiento por consecutivo',
		nullable: true,
	})
	number?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de creación',
		nullable: true,
	})
	createdAt?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de actualización',
		nullable: true,
	})
	updatedAt?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por valor del recibo',
		nullable: true,
	})
	value?: number;

	@Field(() => Number, {
		description: 'Ordenamiento por estado del recibo',
		nullable: true,
	})
	status?: number;
}

@InputType({ description: 'Filtros para consultar los recibos de caja' })
export class FiltersReceiptsInput {
	@Field(() => Number, {
		description: 'Número consecutivo del recibo',
		nullable: true,
	})
	number?: number;

	@Field(() => StatusReceipt, { description: 'Estado del recibo' })
	status?: StatusReceipt;

	@Field(() => String, {
		description: 'Fecha inicial para la busqueda',
		nullable: true,
	})
	dateInitial?: string;

	@Field(() => String, {
		description: 'Fecha final para la busqueda',
		nullable: true,
	})
	dateFinal?: string;

	@Field(() => String, {
		description: 'Identificador del medio de pago',
		nullable: true,
	})
	paymentId?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortReceipt, { description: 'Ordenamiento', nullable: true })
	sort?: SortReceipt;
}

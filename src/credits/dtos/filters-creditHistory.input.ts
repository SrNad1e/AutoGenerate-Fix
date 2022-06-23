import { Field, InputType } from '@nestjs/graphql';
import { TypeCreditHistory } from '../entities/credit-history.entity';

import { StatusCredit } from '../entities/credit.entity';

@InputType({ description: 'Ordenamiento de los créditos' })
export class SortCreditHistory {
	@Field(() => Number, { description: 'Ordenamiento por monto aprobado' })
	amount: number;

	@Field(() => Number, { description: 'Tipo de historico de créditos' })
	type: number;

	@Field(() => Number, { description: 'Ordenamiento por fecha de creación' })
	createdAt: number;

	@Field(() => Number, {
		description: 'Ordenamiento por fecha de actualización',
	})
	updatedAt: number;
}

@InputType({
	description: 'Filtros para consultar los créditos de los clientes',
})
export class FiltersCreditHistoryInput {
	@Field(() => String, {
		description: 'Identificador del cliente',
		nullable: true,
	})
	customerId?: string;

	@Field(() => Number, {
		description: 'Monto del movimiento',
		nullable: true,
	})
	amount?: number;

	@Field(() => TypeCreditHistory, {
		description: 'Tipo del histórico de movimiento',
		nullable: true,
	})
	type?: TypeCreditHistory;

	@Field(() => StatusCredit, {
		description: 'Identificador del crédito',
		nullable: true,
	})
	creditId?: StatusCredit;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortCreditHistory, {
		description: 'Ordenamiento',
		nullable: true,
	})
	sort?: SortCreditHistory;
}

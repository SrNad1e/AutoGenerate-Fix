import { Field, InputType } from '@nestjs/graphql';

import { StatusCredit } from '../entities/credit.entity';

@InputType({ description: 'Ordenamiento de los créditos' })
export class SortCredit {
	@Field(() => Number, { description: 'Ordenamiento por monto aprobado' })
	amount: number;

	@Field(() => Number, { description: 'Ordenamiento por estado' })
	status: number;

	@Field(() => Number, { description: 'Ordenamiento por monto disponible' })
	available: number;

	@Field(() => Number, { description: 'Ordenamiento por monto ocupado' })
	balance: number;

	@Field(() => Number, { description: 'Ordenamiento por monto congelado' })
	frozenAmount: number;

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
export class FiltersCreditsInput {
	@Field(() => String, {
		description: 'Identificador del cliente',
		nullable: true,
	})
	customerId?: string;

	@Field(() => Number, {
		description: 'Monto aprobado al cliente',
		nullable: true,
	})
	amount?: number;

	@Field(() => StatusCredit, {
		description: 'Estado del crédito',
		nullable: true,
	})
	status?: StatusCredit;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field(() => SortCredit, { description: 'Ordenamiento', nullable: true })
	sort?: SortCredit;
}

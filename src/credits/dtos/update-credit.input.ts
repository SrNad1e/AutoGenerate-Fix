import { Field, InputType } from '@nestjs/graphql';
import { TypeCreditHistory } from '../entities/credit-history.entity';
import { StatusCredit } from '../entities/credit.entity';

@InputType({ description: 'Detalle para agregar al crédito' })
export class DetailAddCredit {
	@Field(() => String, { description: 'Pedido que afecta la cartera' })
	orderId: string;

	@Field(() => TypeCreditHistory, { description: 'Tipo de movimiento' })
	type: TypeCreditHistory;

	@Field(() => Number, { description: 'Valor que afecta la cartera' })
	total: number;
}

@InputType({ description: 'Datos para actualizar un crédito' })
export class UpdateCreditInput {
	@Field(() => DetailAddCredit, {
		description: 'Detalles para agregar al crédito',
		nullable: true,
	})
	detailAddCredit?: DetailAddCredit;

	@Field(() => StatusCredit, {
		description: 'Estado del crédito',
		nullable: true,
	})
	status?: StatusCredit;
}

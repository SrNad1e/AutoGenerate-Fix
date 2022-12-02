import { Field, InputType } from '@nestjs/graphql';

import { StatusExpense } from '../entities/expense.entity';

@InputType({ description: 'Datos para actualizar el egreso' })
export class UpdateExpenseInput {
	@Field(() => StatusExpense, {
		description: 'Estado del egreso',
		nullable: true,
	})
	status?: StatusExpense;
}

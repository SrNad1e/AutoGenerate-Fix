import { Field, InputType } from '@nestjs/graphql';
import { StatusReceipt } from '../entities/receipt.entity';

@InputType({ description: 'Datos para actualizar el recibo' })
export class UpdateReceiptInput {
	@Field(() => StatusReceipt, {
		description: 'Estado del pedido',
		nullable: true,
	})
	status?: StatusReceipt;
}

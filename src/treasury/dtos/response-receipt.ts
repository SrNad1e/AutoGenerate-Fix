import { Field, ObjectType } from '@nestjs/graphql';
import { Credit } from 'src/credits/entities/credit.entity';
import { Receipt } from '../entities/receipt.entity';

@ObjectType({ description: 'Resultado al crear un recibo de caja' })
export class ResponseReceipt {
	@Field(() => Credit, {
		description: 'Crédito afectado por el recibo de caja',
	})
	credit: Credit;

	@Field(() => Receipt, { description: 'Recibo de caja generado' })
	receipt: Receipt;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para verificar los errores de pedido' })
export class VerifiedErrorsCashInput {
	@Field(() => String, {
		description: 'Motivo por el cual se verificar el error',
	})
	reason: string;

	@Field(() => String, {
		description: 'Identificador del error de efectivo',
	})
	errorCashId: string;
}

import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreatePaymentInput } from './create-payment.input';

@InputType({ description: 'Datos para actualizar método de pago' })
export class UpdatePaymentInput extends PartialType(CreatePaymentInput) {
	@Field(() => Boolean, { description: 'Estado del método de pago' })
	active?: boolean;
}

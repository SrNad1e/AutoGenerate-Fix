import { Field, InputType } from '@nestjs/graphql';
import { TypePayment } from '../entities/payment.entity';

@InputType({ description: 'Datos para crear un método de pago' })
export class CreatePaymentInput {
	@Field(() => String, { description: 'Nombre del método de pago' })
	name: string;

	@Field(() => TypePayment, { description: 'Tipo de método de pago' })
	type: TypePayment;

	@Field(() => String, {
		description: 'Color en html que representa el método de pago ',
		nullable: true,
	})
	color?: string;

	@Field(() => String, {
		description: 'Identificador de la imagen del método de pago',
		nullable: true,
	})
	logoId?: string;

	@Field(() => String, {
		description: 'Mensaje para el medio de pago',
		nullable: true,
	})
	message?: string;

	@Field(() => [String], {
		description: 'Identificador de tiendas que usan el método de pago',
	})
	shopIds: string[];
}

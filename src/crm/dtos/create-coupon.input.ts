import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación del cupón' })
export class CreateCouponInput {
	@Field(() => Number, { description: 'Monto para crear el cupón' })
	value: number;

	@Field(() => Date, { description: 'Fecha de expiración para el cupón' })
	expiration: Date;

	@Field(() => String, { description: 'Titulo del cupón' })
	title: string;

	@Field(() => String, { description: 'Mensaje del cupón' })
	message: string;
}

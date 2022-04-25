import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar la talla' })
export class UpdateSizeInput {
	@Field(() => String, {
		description: 'Valor asignado a la talla',
		nullable: true,
	})
	value?: string;

	@Field(() => Boolean, {
		description: 'Se encuentra activa la talla',
		nullable: true,
	})
	active?: boolean;
}

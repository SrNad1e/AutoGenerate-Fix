import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear una talla' })
export class CreateSizeInput {
	@Field(() => String, { description: 'Valor asignado a la talla' })
	value: string;
}

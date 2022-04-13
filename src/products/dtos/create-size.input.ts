import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSizeInput {
	@Field(() => String, { description: 'Valor asignado a la talla' })
	name: string;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateSizeInput {
	@Field(() => String, {
		description: 'Valor asignado a la talla',
		nullable: true,
	})
	name?: string;

	@Field(() => Boolean, {
		description: 'Se encuentra activa la talla',
		nullable: true,
	})
	active?: boolean;
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar el atributo' })
export class UpdateAttribInput {
	@Field(() => String, {
		description: 'Valor asignado al atributo',
		nullable: true,
	})
	name?: string;

	@Field(() => Boolean, {
		description: 'Se encuentra activa el atributo',
		nullable: true,
	})
	active?: boolean;
}

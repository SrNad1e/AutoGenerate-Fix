import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un atributo' })
export class CreateAttribInput {
	@Field(() => String, { description: 'Nombre del atributo' })
	name: string;
}

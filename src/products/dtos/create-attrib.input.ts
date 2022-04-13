import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAttribInput {
	@Field(() => String, { description: 'Nombre del atributo' })
	name: string;
}

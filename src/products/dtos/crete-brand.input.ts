import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBrandInput {
	@Field(() => String, { description: 'Nombre de la marca' })
	name: string;
}

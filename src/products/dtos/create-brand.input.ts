import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear una marca' })
export class CreateBrandInput {
	@Field(() => String, { description: 'Nombre de la marca' })
	name: string;
}

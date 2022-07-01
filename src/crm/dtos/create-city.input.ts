import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear una ciudad' })
export class CreateCityInput {
	@Field(() => String, { description: 'Nombre de la ciudad' })
	name: string;

	@Field(() => String, { description: 'Nombre del departamento' })
	state: string;

	@Field(() => String, { description: 'Nombre del país' })
	country: string;
}

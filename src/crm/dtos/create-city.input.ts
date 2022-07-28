import { Field, InputType } from '@nestjs/graphql';
import { ZoneType } from 'src/configurations/entities/conveyor.entity';

@InputType({ description: 'Datos para crear una ciudad' })
export class CreateCityInput {
	@Field(() => String, { description: 'Nombre de la ciudad' })
	name: string;

	@Field(() => String, { description: 'Nombre del departamento' })
	state: string;

	@Field(() => String, { description: 'Nombre del país' })
	country: string;

	@Field(() => ZoneType, { description: 'Tipo de zona' })
	zone: ZoneType;
}

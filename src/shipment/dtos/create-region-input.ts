import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de una zona' })
export class CreateRegionInput {
	@Field({ description: 'Nombre de la ciudad' })
	city: string;

	@Field({ description: 'departamento de la region', nullable: true })
	dpto?: string;

	@Field({ description: 'Descricion de la zona', nullable: true })
	country?: string;

	@Field({ description: 'Descricion de la zona', nullable: true })
	idZone?: string;

	@Field(() => Boolean, {
		description: 'Identifica el estado de la zona',
		nullable: true,
	})
	state?: boolean;

}

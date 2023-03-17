import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de una zona' })
export class CreateZoneInput {
	@Field({ description: 'Nombre de la zona' })
	name: string;

	@Field({ description: 'Descricion de la zona', nullable: true })
	description?: string;

	@Field(() => Boolean, {
		description: 'Identifica el estado de la zona',
		nullable: true,
	})
	state?: boolean;

	@Field({ description: 'Descricion de la zona', nullable: true })
	user?: string;
}

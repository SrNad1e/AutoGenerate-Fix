import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar el rol' })
export class UpdateZoneInput {
	@Field({ description: 'Nombre de la zona' })
	name: string;

	@Field({ description: 'Descricion de la zona', nullable: true })
	description?: string;

	@Field(() => Boolean, {
		description: 'Identifica el estado de la zona',
		nullable: true,
	})
	state?: boolean;
}

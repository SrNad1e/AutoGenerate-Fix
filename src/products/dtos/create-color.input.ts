import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un color' })
export class CreateColorInput {
	@Field(() => String, { description: 'Nombre asignado al color' })
	name: string;

	@Field(() => String, { description: 'Nombre interno asignado al color' })
	name_internal: string;

	@Field(() => String, { description: 'Url asignado al color' })
	html: string;

	@Field(() => String, {
		description: 'Identificador de la imagen asignada al color',
		nullable: true,
	})
	imageId?: string;
}

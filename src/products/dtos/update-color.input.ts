import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para actualizar el color' })
export class UpdateColorInput {
	@Field(() => String, {
		description: 'Nombre asignado al color',
		nullable: true,
	})
	name?: string;

	@Field(() => String, {
		description: 'Nombre interno asignado al color',
		nullable: true,
	})
	name_internal?: string;

	@Field(() => Boolean, {
		description: 'Estado asignado al color',
		nullable: true,
	})
	active?: boolean;

	@Field(() => String, { description: 'Url asignado al color', nullable: true })
	html?: string;

	@Field(() => String, {
		description: 'Imagen asignada al color',
		nullable: true,
	})
	image?: string;
}

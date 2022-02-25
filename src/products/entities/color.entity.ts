import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Color {
	@Field(() => String, { description: 'Nombre del color' })
	name: string;

	@Field(() => String, { description: 'Url de la imagen del color' })
	html: string;
}

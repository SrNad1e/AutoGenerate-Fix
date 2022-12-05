import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear la caja' })
export class CreateBoxInput {
	@Field(() => String, { description: 'Nombre de la caja' })
	name: string;

	@Field(() => Number, { description: 'Cantidad de la base para la caja' })
	base: number;

	@Field(() => Boolean, {
		description: 'Es caja principal de la compañía',
		nullable: true,
	})
	isMain?: boolean;
}

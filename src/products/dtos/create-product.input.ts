import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un producto' })
export class CreateProductInput {
	@Field(() => String, { description: 'Identificador de la referencia' })
	referenceId: string;

	@Field(() => String, { description: 'Identificador del producto' })
	colorId: string;

	@Field(() => String, { description: 'Identificador del producto' })
	sizeId: string;

	@Field(() => [String], {
		description: 'Identificador de las imagenes del producto',
		nullable: true,
	})
	imagesId: string[];
}

import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para crear un producto' })
export class CreateProductInput {
	@Field(() => String, { description: 'Identificador de la referencia' })
	referenceId: string;

	@Field(() => String, { description: 'Identificador del color' })
	colorId: string;

	@Field(() => String, { description: 'Identificador de la talla' })
	sizeId: string;
}

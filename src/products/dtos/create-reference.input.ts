import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreateReferenceInput {
	@Field(() => String, { description: 'Nombre de la referencia' })
	name: string;

	@Field(() => String, { description: 'Descripción de la referencia' })
	description: string;

	@Field(() => Boolean, { description: 'Se puede cambiar' })
	changeable: boolean;

	@Field(() => Number, { description: 'Precio de la referencia' })
	price: number;

	@Field(() => Number, { description: 'Costo de la referencia' })
	cost: number;

	@Field(() => Number, { description: 'Ancho del producto' })
	width: number;

	@Field(() => Number, { description: 'Alto del producto' })
	height: number;

	@Field(() => Number, { description: 'Largo del producto' })
	long: number;

	@Field(() => Number, { description: 'Peso del producto' })
	weight: number;

	@Field(() => Number, { description: 'Volumen del producto' })
	volume: number;

	@Field(() => String, { description: 'Marca de la referencia' })
	brand: string;

	@Field(() => String, { description: 'Compañía de la referencia' })
	company: string;

	@Field(() => String, { description: 'Categoría nivel 1 de la referencia' })
	categoryLevel1: string;

	@Field(() => String, { description: 'Categoría nivel 2 de la referencia' })
	categoryLevel2: string;

	@Field(() => String, { description: 'Categoría nivel 3 de la referencia' })
	categoryLevel3: string;
}

import { Field, InputType } from '@nestjs/graphql';
@InputType({ description: 'Combinaciones de color y talla' })
export class CombinationInput {
	@Field(() => String, { description: 'Identificador del color' })
	colorId: string;

	@Field(() => String, { description: 'Identificador de la talla' })
	sizeId: string;

	@Field(() => [String], {
		description: 'Identificadores de las imagenes',
		nullable: true,
	})
	imageIds?: string[];
}

@InputType({ description: 'Datos para crear una referencia' })
export class CreateReferenceInput {
	@Field(() => String, { description: 'Nombre de la referencia' })
	name: string;

	@Field(() => String, { description: 'Descripción de la referencia' })
	description: string;

	@Field(() => Boolean, { description: 'Se puede cambiar', nullable: true })
	changeable?: boolean;

	@Field(() => Boolean, {
		description: 'Estado de la referencia',
		nullable: true,
	})
	active?: boolean;

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
	brandId: string;

	@Field(() => String, { description: 'Categoría nivel 1 de la referencia' })
	categoryLevel1Id: string;

	@Field(() => String, { description: 'Categoría nivel 2 de la referencia' })
	categoryLevel2Id: string;

	@Field(() => String, { description: 'Categoría nivel 3 de la referencia' })
	categoryLevel3Id: string;

	@Field(() => [CombinationInput], {
		description: 'Combinaciones de talla y color para crear los productos',
		nullable: true,
	})
	combinations?: CombinationInput[];

	@Field(() => [String], {
		description: 'Atributos de la referencia',
	})
	attribIds: string[];
}

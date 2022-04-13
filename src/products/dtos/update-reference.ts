import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateReferenceInput {
	@Field(() => String, {
		description: 'Nombre de la referencia',
		nullable: true,
	})
	name: string;

	@Field(() => String, {
		description: 'Descripción de la referencia',
		nullable: true,
	})
	description: string;

	@Field(() => Boolean, {
		description: 'Se puede cambiar de la referencia',
		nullable: true,
	})
	changeable: boolean;

	@Field(() => Number, {
		description: 'Precio de la referencia',
		nullable: true,
	})
	price: number;

	@Field(() => Number, {
		description: 'Costo de la referencia',
		nullable: true,
	})
	cost: number;

	@Field(() => String, {
		description: 'Identificador de la marca de la referencia',
		nullable: true,
	})
	brandId: string;

	@Field(() => String, {
		description: 'Identificador de la categoría level 1 de la referencia',
		nullable: true,
	})
	categoryLevel1Id: string;

	@Field(() => String, {
		description: 'Identificador de la categoría level 2 de la referencia',
		nullable: true,
	})
	categoryLevel2Id: string;

	@Field(() => String, {
		description: 'Identificador de la categoría level 3 de la referencia',
		nullable: true,
	})
	categoryLevel3Id: string;

	@Field(() => [String], {
		description: 'Identificador de los atributos de la referencia',
		nullable: true,
	})
	attribIds: string[];

	@Field(() => Number, { description: 'Ancho del producto', nullable: true })
	width: number;

	@Field(() => Number, { description: 'Alto del producto', nullable: true })
	height: number;

	@Field(() => Number, { description: 'Largo del producto', nullable: true })
	long: number;

	@Field(() => Number, { description: 'Peso del producto', nullable: true })
	weight: number;

	@Field(() => Number, { description: 'Volumen del producto', nullable: true })
	volume: number;
}

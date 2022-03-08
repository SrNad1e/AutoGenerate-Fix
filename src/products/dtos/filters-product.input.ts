import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class SortProduct {
	@Field(() => Number, { nullable: true })
	reference?: number;

	@Field(() => Number, { nullable: true })
	description?: number;

	@Field(() => Number, { nullable: true })
	barcode?: number;

	@Field(() => Number, { nullable: true })
	changeable?: number;

	@Field(() => Number, { nullable: true })
	price?: number;

	@Field(() => Number, { nullable: true })
	cost?: number;

	@Field(() => Number, { nullable: true })
	status?: number;
}

@InputType()
export class FiltersProductsInput {
	@Field(() => [String], {
		description: 'Identificadores de mongo',
		nullable: true,
	})
	ids: string[];

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	skip?: number;

	@Field({ description: 'Estado del producto', nullable: true })
	status?: string;

	@Field({
		description:
			'Comodín para la busqueda del producto, barcode, referencem description',
		nullable: true,
	})
	name?: string;

	@Field({ description: 'Id de color', nullable: true })
	colorId?: string;

	@Field({ description: 'Id de talla', nullable: true })
	sizeId?: string;

	@Field(() => SortProduct, { description: 'Ordenamiento', nullable: true })
	sort?: SortProduct;
}

@InputType()
export class FiltersProductInput {
	@Field(() => String, {
		description: 'Identificador de mongo',
		nullable: true,
	})
	_id?: Types.ObjectId;

	@Field({ description: 'Código de barras producto', nullable: true })
	barcode?: string;

	@Field(() => String, {
		description: 'Referencia del producto',
		nullable: true,
	})
	reference?: string;

	@Field(() => String, {
		description: 'Descripción del producto',
		nullable: true,
	})
	description?: string;
}

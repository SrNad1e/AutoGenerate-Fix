import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de productos' })
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

@InputType({ description: 'Filtros para la lista de productos' })
export class FiltersProductsInput {
	@Field(() => [String], {
		description: 'Identificadores de mongo',
		nullable: true,
	})
	ids?: string[];

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página actual', nullable: true })
	page?: number;

	@Field({ description: 'Estado del producto', nullable: true })
	status?: string;

	@Field({
		description:
			'Comodín para la busqueda del producto, barcode, referencem description',
		nullable: true,
	})
	name?: string;

	@Field({
		description:
			'Se usa para seleccionar solo los productos que tengan inventario',
		nullable: true,
	})
	withStock?: boolean;

	@Field({ description: 'Id de color', nullable: true })
	colorId?: string;

	@Field({ description: 'Id de talla', nullable: true })
	sizeId?: string;

	@Field({ description: 'Id de referencia', nullable: true })
	referenceId?: string;

	@Field(() => SortProduct, { description: 'Ordenamiento', nullable: true })
	sort?: SortProduct;

	@Field(() => String, {
		description:
			'Bodega de inventario o "all" para traer todos los inventarios',
		nullable: true,
	})
	warehouseId?: string;
}

@InputType()
export class FiltersProductInput {
	@Field(() => String, {
		description: 'Identificador de mongo',
		nullable: true,
	})
	_id?: string;

	@Field({ description: 'Código de barras producto', nullable: true })
	barcode?: string;

	@Field({ description: 'Color del producto', nullable: true })
	color?: string;

	@Field({ description: 'talla del producto', nullable: true })
	size?: string;

	@Field({ description: 'Estado del producto', nullable: true })
	status?: string;

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

	@Field(() => String, {
		description:
			'Bodega de inventario o "all" para traer todos los inventarios',
		nullable: true,
	})
	warehouseId?: string;
}

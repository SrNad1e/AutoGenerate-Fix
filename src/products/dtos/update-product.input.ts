import { Field, InputType } from '@nestjs/graphql';
import { StatusProduct } from '../entities/product.entity';

@InputType({ description: 'Datos para actualizar el producto' })
export class UpdateProductInput {
	@Field(() => String, {
		description: 'Identificador del color',
		nullable: true,
	})
	colorId?: string;

	@Field(() => String, {
		description: 'Identificador de la talla',
		nullable: true,
	})
	sizeId?: string;

	@Field(() => StatusProduct, {
		description: 'Estado del producto',
		nullable: true,
	})
	status?: StatusProduct;

	@Field(() => String, {
		description: 'Código de barras del producto',
		nullable: true,
	})
	barcode?: string;

	@Field(() => [String], {
		description: 'Identificador de las imagenes del producto',
		nullable: true,
	})
	imagesId?: string[];
}

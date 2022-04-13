import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput {
	@Field(() => String, {
		description: 'Identificador del color',
		nullable: true,
	})
	colorId: string;

	@Field(() => String, {
		description: 'Identificador de la talla',
		nullable: true,
	})
	sizeId: string;

	@Field(() => String, {
		description: 'Estado del producto (active, inactive)',
		nullable: true,
	})
	status: string;

	@Field(() => String, {
		description: 'Código de barras del producto',
		nullable: true,
	})
	barcode: string;
}
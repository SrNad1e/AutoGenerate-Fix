import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FiltersProductInput {
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

	/*@Field(() => raw, { description: 'Número del traslado', nullable: true })
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;*/
}

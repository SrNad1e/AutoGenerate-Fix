import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Ordenamiento para el listado de imagenes' })
export class SortImage {
	@Field({ nullable: true })
	name?: number;
}

@InputType({ description: 'Filtros para la lista de imagenes' })
export class FiltersImagesInput {
	@Field({ description: 'Comodín busqueda de la imagen', nullable: true })
	name?: string;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Página', nullable: true })
	page?: number;

	@Field(() => SortImage, { description: 'Ordenamiento', nullable: true })
	sort?: SortImage;
}

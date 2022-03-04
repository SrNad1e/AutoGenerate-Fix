import { Field, ObjectType } from '@nestjs/graphql';

import { Color } from '../entities/color.entity';

@ObjectType()
export class ColorResponse {
	@Field(() => [Color], { description: 'Lista de colores' })
	docs: Color[];

	@Field(() => Number, { description: 'Total de documentos' })
	totalDocs: number;

	@Field(() => Number, { description: 'Total de docuementos solicitados' })
	limit: number;

	@Field(() => Number, { description: 'Total de páginas' })
	totalPages: number;

	@Field(() => Number, { description: 'Página actual' })
	page: number;

	@Field(() => Number, { description: '' })
	pagingCounter: number;

	@Field(() => Boolean, { description: '¿Encuentra página anterior?' })
	hasPrevPage: boolean;

	@Field(() => Boolean, { description: '¿Encuentra página siguiente?' })
	hasNextPage: boolean;

	@Field(() => Number || null, { description: 'Página anterior' })
	prevPage: number | null;

	@Field(() => Number || null, { description: 'Página siguente' })
	nextPage: number | null;

	/*@Field({ description: 'Número del traslado', nullable: true })
	sort?: Record<string, 1 | -1 | { $meta: 'textScore' }>;*/
}

import { Field, ObjectType } from '@nestjs/graphql';

import { Box } from '../entities/box.entity';

@ObjectType({ description: 'Respuesta a la consulta de cajas' })
export class ResponseBoxes {
	@Field(() => [Box], { description: 'Lista de cajas' })
	docs: Box[];

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
}

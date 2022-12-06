import { Field, ObjectType } from '@nestjs/graphql';

import { Product } from '../entities/product.entity';
import { Reference } from '../entities/reference.entity';

@ObjectType({ description: 'Respuesta de la referencias' })
export class ReferenceData extends Reference {
	@Field(() => [Product], { description: 'Productos de la referencia' })
	products: Product[];

	@Field(() => Number, {
		description: 'Precio con descuento si se envía el tipo de cliente',
	})
	discountPrice: number;
}

@ObjectType({ description: 'Respuesta al listado de las referencias' })
export class ResponseReferences {
	@Field(() => [ReferenceData], {
		description: 'Lista de referencias',
	})
	docs: ReferenceData[];

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

import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { FiltersDocumentTypesInput } from '../dtos/filters-document-types.input';
import { DocumentType } from '../entities/documentType.entity';
import { DocumentTypesService } from '../services/document-types.service';

@Resolver()
export class DocumentTypesResolver {
	constructor(private readonly documentTypesService: DocumentTypesService) {}

	@Query(() => [DocumentType], {
		name: 'documentTypes',
		description: 'Listado de tipos de documento',
	})
	findAll(
		@Args({
			name: 'filtersDocumentTypesInput',
			nullable: true,
			defaultValue: {},
			description: 'Filtros para consultar el listado de tipos de documento',
		})
		_: FiltersDocumentTypesInput,
		@Context() context,
	) {
		return this.documentTypesService.findAll(context.req.body.variables.input);
	}
}

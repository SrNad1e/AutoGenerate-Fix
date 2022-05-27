import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { FiltersDocumentTypesInput } from '../dtos/filters-document-types.input';
import { DocumentType } from '../entities/documentType.entity';

@Injectable()
export class DocumentTypesService {
	constructor(
		@InjectModel(DocumentType.name)
		private readonly documentTypeModel: PaginateModel<DocumentType>,
	) {}

	async findAll(filters: FiltersDocumentTypesInput) {
		return this.documentTypeModel.find(filters).lean();
	}

	async findById(id: string) {
		return this.documentTypeModel.findById(id).lean();
	}
}

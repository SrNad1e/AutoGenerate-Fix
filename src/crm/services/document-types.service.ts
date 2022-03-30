import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { DocumentType } from '../entities/documentType.entity';

@Injectable()
export class DocumentTypesService {
	constructor(
		@InjectModel(DocumentType.name)
		private readonly documentTypeModel: PaginateModel<DocumentType>,
	) {}

	async findById(id: string) {
		return this.documentTypeModel.findById(id);
	}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { CategoryLevel1 } from '../entities/category-level1.entity';
import { CategoryLevel2 } from '../entities/category-level2.entity';
import { CategoryLevel3 } from '../entities/category-level3.entity';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectModel(CategoryLevel1.name)
		private readonly categoryLevel1Model: PaginateModel<CategoryLevel1>,
		@InjectModel(CategoryLevel2.name)
		private readonly categoryLevel2Model: PaginateModel<CategoryLevel2>,
		@InjectModel(CategoryLevel3.name)
		private readonly categoryLevel3Model: PaginateModel<CategoryLevel3>,
	) {}

	async findById(_id: string, level: number) {
		switch (level) {
			case 1:
				return this.categoryLevel1Model.findById(_id).lean();
			case 2:
				return this.categoryLevel2Model.findById(_id).lean();
			case 3:
				return this.categoryLevel3Model.findById(_id).lean();
			default:
				break;
		}
	}
}

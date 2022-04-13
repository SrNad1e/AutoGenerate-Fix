import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateReferenceInput } from '../dtos/create-reference.input';
import { FiltersReferenceInput } from '../dtos/filters-reference.input';
import { FiltersReferencesInput } from '../dtos/filters-references.input';
import { Attrib } from '../entities/attrib.entity';
import { Brand } from '../entities/brand.entity';
import { CategoryLevel1 } from '../entities/category-level1.entity';
import { CategoryLevel2 } from '../entities/category-level2.entity';
import { CategoryLevel3 } from '../entities/category-level3.entity';
import { Company } from '../entities/company.entity';
import { Reference } from '../entities/reference.entity';

const populate = [
	{ path: 'brand', model: Brand.name },
	{ path: 'categoryLevel1', model: CategoryLevel1.name },
	{ path: 'categoryLevel2', model: CategoryLevel2.name },
	{ path: 'categoryLevel3', model: CategoryLevel3.name },
	{ path: 'attribs', model: Attrib.name },
	{ path: 'companies', model: Company.name },
];

@Injectable()
export class ReferencesService {
	constructor(
		@InjectModel(Reference.name)
		private readonly referenceModel: PaginateModel<Reference>,
	) {}

	async findAll(
		{
			brandId,
			cost,
			limit = 10,
			page = 1,
			name = '',
			sort,
			price,
		}: FiltersReferencesInput,
		user: Partial<User>,
	) {
		const filters: FilterQuery<Reference> = {};

		if (brandId) {
			filters.brand = brandId;
		}

		if (cost) {
			filters.cost = cost;
		}

		if (price) {
			filters.price = price;
		}

		if (name) {
			filters.$text = {
				$search: `"${name}"`,
			};
		}

		if (user?.company['_id']) {
			filters.company = new Types.ObjectId(user?.company['_id']);
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		return this.referenceModel.paginate(filters, options);
	}

	async findOne(params: FiltersReferenceInput) {
		return this.referenceModel.findOne(params).lean();
	}

	async create(
		{ weight, width, long, volume, height, ...props }: CreateReferenceInput,
		user: User,
	) {
		const reference = new this.referenceModel({
			...props,
			user,
			shipping: {
				weight,
				width,
				long,
				volume,
				height,
			},
		});

		return reference.save();
	}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { CreateReferenceInput } from '../dtos/create-reference.input';
import { FiltersReferenceInput } from '../dtos/filters-reference.input';
import { FiltersReferencesInput } from '../dtos/filters-references.input';
import { Reference } from '../entities/reference.entity';

@Injectable()
export class ReferencesService {
	constructor(
		@InjectModel(Reference.name)
		private readonly referenceModel: PaginateModel<Reference>,
	) {}

	async findAll({
		brandId,
		cost,
		name,
		price,
		companyId,
	}: FiltersReferencesInput) {
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

		if (companyId) {
			filters.company = new Types.ObjectId(companyId);
		}

		return this.referenceModel.find(filters).lean();
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

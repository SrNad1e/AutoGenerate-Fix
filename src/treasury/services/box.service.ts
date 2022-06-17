import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { FiltersBoxesInput } from '../dtos/filters-boxes.input';
import { Box } from '../entities/box.entity';

@Injectable()
export class BoxService {
	constructor(
		@InjectModel(Box.name) private readonly boxModel: PaginateModel<Box>,
	) {}

	async findAll(
		{ _id, name, limit = 10, page = 1 }: FiltersBoxesInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Box> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		const options = {
			limit,
			page,

			lean: true,
		};

		return this.boxModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.boxModel.findById(id).lean();
	}

	async updateTotal(id: string, total: number) {
		return this.boxModel.findByIdAndUpdate(
			id,
			{
				$set: {
					total,
				},
			},
			{
				new: true,
				lean: true,
			},
		);
	}
}

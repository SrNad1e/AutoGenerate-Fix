import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { FiltersCitiesInput } from '../dtos/filters-cities-input';
import { City } from '../entities/city.entity';

@Injectable()
export class CitiesService {
	constructor(
		@InjectModel(City.name) private readonly cityModel: PaginateModel<City>,
	) {}

	async findAll({
		sort,
		limit = 10,
		page = 1,
		_id,
		country,
		name,
		state,
	}: FiltersCitiesInput) {
		const filters: FilterQuery<City> = {};

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (name) {
			filters.name = {
				$regex: name,
				options: 'i',
			};
		}

		if (state) {
			filters.state = {
				$regex: state,
				options: 'i',
			};
		}

		if (country) {
			filters.country = {
				$regex: country,
				options: 'i',
			};
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.cityModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.cityModel.findById(id).lean();
	}
}

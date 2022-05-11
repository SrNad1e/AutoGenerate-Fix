import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { FiltersCitiesInput } from '../dtos/filters-cities-input';
import { City } from '../entities/city.entity';

@Injectable()
export class CitiesService {
	constructor(
		@InjectModel(City.name) private readonly cityModel: PaginateModel<City>,
	) {}

	async findAll({ sort, limit = 10, page = 1, ...params }: FiltersCitiesInput) {
		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.cityModel.paginate(params, options);
	}

	async findById(id: string) {
		return this.cityModel.findById(id).lean();
	}
}

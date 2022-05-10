import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { Image } from 'src/staticfiles/entities/image.entity';
import { FiltersConveyorsInput } from '../dtos/filters-conveyors.input';
import { Conveyor } from '../entities/conveyor.entity';

const populate = [
	{
		path: 'logo',
		model: Image.name,
	},
];

@Injectable()
export class ConveyorsService {
	constructor(
		@InjectModel(Conveyor.name)
		private readonly conveyorModel: PaginateModel<Conveyor>,
	) {}

	async findAll({ sort, limit = 10, name, page = 1 }: FiltersConveyorsInput) {
		const filters: FilterQuery<Conveyor> = {};

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}
		const options = {
			sort,
			limit,
			page,
			lean: true,
			populate,
		};
		return this.conveyorModel.paginate(filters, options);
	}
}

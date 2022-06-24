import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';

import { FiltersCustomerTypesInput } from '../dtos/filters-customer-types.input';
import { CustomerType } from '../entities/customerType.entity';

@Injectable()
export class CustomerTypeService {
	constructor(
		@InjectModel(CustomerType.name)
		private readonly customerTypeModel: PaginateModel<CustomerType>,
	) {}

	async findAll({
		_id,
		name,
		limit = 10,
		page = 1,
	}: FiltersCustomerTypesInput) {
		const filters: FilterQuery<CustomerType> = {};
		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		const options: PaginateOptions = {
			limit,
			page,
			lean: true,
		};

		return this.customerTypeModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.customerTypeModel.findById(id).lean();
	}

	async findOne(name: string) {
		return this.customerTypeModel.findOne({ name }).lean();
	}
}

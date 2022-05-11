import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { FiltersPaymentsInput } from '../dtos/filters-payments.input';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
	constructor(
		@InjectModel(Payment.name)
		private readonly paymentModel: PaginateModel<Payment>,
	) {}

	async findAll({
		active,
		limit = 10,
		name,
		page = 1,
		sort,
		type,
	}: FiltersPaymentsInput) {
		const filters: FilterQuery<Payment> = {};

		if (active !== undefined) {
			filters.active = active;
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (type) {
			filters.type = type;
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.paymentModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.paymentModel.findById(id).lean();
	}
}

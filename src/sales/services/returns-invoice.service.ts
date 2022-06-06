import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { FiltersReturnsInvoiceInput } from '../dtos/filters-returns-invoice';
import { ReturnInvoice } from '../entities/return-invoice.entity';
import { User } from 'src/configurations/entities/user.entity';

@Injectable()
export class ReturnsInvoiceService {
	constructor(
		@InjectModel(ReturnInvoice.name)
		private readonly returnInvoiceModel: PaginateModel<ReturnInvoice>,
	) {}

	async findAll(
		{
			sort,
			active,
			limit = 20,
			page = 1,
			dateFinal,
			dateInitial,
		}: FiltersReturnsInvoiceInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<ReturnInvoice> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (active !== undefined) {
			filters.active = active;
		}

		if (dateInitial) {
			if (!dateFinal) {
				throw new BadRequestException('Debe enviarse una fecha final');
			}

			filters['createdAt'] = {
				$gte: new Date(dateInitial),
				$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
			};
		} else if (dateFinal) {
			if (!dateInitial) {
				throw new BadRequestException('Debe enviarse una fecha inicial');
			}
			filters['createdAt'] = {
				$gte: new Date(dateInitial),
				$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
			};
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.returnInvoiceModel.paginate(filters, options);
	}
}

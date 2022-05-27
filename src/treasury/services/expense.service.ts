import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { FiltersExpensesInput } from '../dtos/filters-expenses.input';
import { Expense } from '../entities/expense.entity';

@Injectable()
export class ExpenseService {
	constructor(
		@InjectModel(Expense.name)
		private readonly expenseModel: PaginateModel<Expense>,
	) {}

	async findAll(
		{
			boxId,
			dateFinal,
			dateInitial,
			limit = 10,
			page = 1,
			sort,
			status,
		}: FiltersExpensesInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Expense> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (boxId) {
			filters.box = new Types.ObjectId(boxId);
		}

		if (status) {
			filters.status = status;
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

		return this.expenseModel.paginate(filters, options);
	}
}

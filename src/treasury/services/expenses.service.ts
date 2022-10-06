import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { StatusBoxHistory } from '../dtos/create-boxHistory.input';
import { CreateExpenseInput } from '../dtos/create-expense.input';
import { FiltersExpensesInput } from '../dtos/filters-expenses.input';
import { UpdateExpenseInput } from '../dtos/update-expense.input';
import { Box } from '../entities/box.entity';
import { Expense, StatusExpense } from '../entities/expense.entity';
import { BoxHistoryService } from './box-history.service';
import { BoxService } from './box.service';

const populate = [
	{
		path: 'box',
		model: Box.name,
	},
];

@Injectable()
export class ExpensesService {
	constructor(
		@InjectModel(Expense.name)
		private readonly expenseModel: PaginateModel<Expense>,
		private readonly boxService: BoxService,
		private readonly boxHistoryService: BoxHistoryService,
	) {}

	async findAll(
		{
			boxId,
			dateFinal,
			dateInitial,
			number,
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

		if (number) {
			filters.number = number;
		}

		if (boxId) {
			filters.box = new Types.ObjectId(boxId);
		}

		if (status) {
			filters.status = StatusExpense[status] || status;
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
			populate,
			lean: true,
		};

		return this.expenseModel.paginate(filters, options);
	}

	async create(
		{ boxId, value, concept }: CreateExpenseInput,
		user: User,
		companyId: string,
	) {
		let box;
		if (boxId) {
			box = await this.boxService.findById(boxId);

			if (!box) {
				throw new BadRequestException('La caja no existe');
			}

			if (box?.company?.toString() !== companyId && user.username !== 'admin') {
				throw new UnauthorizedException(
					'El usuario no esta autorizado para realizar cambios en esta caja',
				);
			}
		}

		if (value <= 0) {
			throw new BadRequestException('El valor del egreso no puede ser 0');
		}

		const expense = await this.expenseModel
			.findOne({
				category: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			});

		const number = (expense?.number || 0) + 1;

		const newExpense = new this.expenseModel({
			number,
			value,
			concept,
			company: new Types.ObjectId(companyId),
			box: box._id,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		await this.boxHistoryService.deleteCash(
			{
				boxId,
				documentId: newExpense._id.toString(),
				documentType: StatusBoxHistory.EXPENSE,
				value,
			},
			user,
			companyId,
		);

		return (await newExpense.save()).populate(populate);
	}

	async update(
		id: string,
		{ status }: UpdateExpenseInput,
		user: User,
		companyId: string,
	) {
		const expense = await this.expenseModel.findById(id).lean();

		if (!expense) {
			throw new BadRequestException(
				'El egreso que intenta actualizar no existe',
			);
		}

		if (
			expense?.company.toString() !== companyId &&
			user.username !== 'admin'
		) {
			throw new UnauthorizedException(
				`El usuario no tiene permisos para actualizar este egreso`,
			);
		}

		if (status === StatusExpense.CANCELLED) {
			await this.boxHistoryService.addCash(
				{
					boxId: expense?.box.toString(),
					documentId: id,
					documentType: StatusBoxHistory.EXPENSE,
					value: expense?.value,
				},
				user,
				companyId,
			);
		}

		return this.expenseModel.findByIdAndUpdate(id, {
			$set: {
				status: StatusExpense[status],
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
		});
	}
}

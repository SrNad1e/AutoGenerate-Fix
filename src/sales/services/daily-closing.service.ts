import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { FiltersDailyClosing } from '../dtos/filters-daily-closing.input';
import { DailyClosing } from '../entities/dailyClosing';
import { PointOfSalesService } from './point-of-sales.service';

const populate: PopulateOptions[] = [
	{
		path: 'company',
		model: 'Company',
	},
	{
		path: 'pointOfSale',
		model: 'PointOfSale',
	},
	{
		path: 'invoices',
		model: 'Invoice',
	},
	{
		path: 'summaryPayments',
		populate: {
			path: 'payment',
			model: 'Payment',
		},
	},
];

@Injectable()
export class DailyClosingService {
	constructor(
		@InjectModel(DailyClosing.name)
		private readonly dailyClosingModel: PaginateModel<DailyClosing>,
		private readonly pointOfSalesService: PointOfSalesService,
	) {}

	async findAll(
		{
			dateInitial,
			dateFinal,
			pointOfSaleId,
			sort,
			limit,
			page,
		}: FiltersDailyClosing,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<DailyClosing> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (dateInitial && dateFinal) {
			if (dayjs(dateInitial).isAfter(dayjs(dateFinal))) {
				throw new Error('La fecha inicial no puede ser mayor a la fecha final');
			}

			const initialDate = dayjs(dateInitial).startOf('day').toDate();
			const finalDate = dayjs(dateFinal).endOf('day').toDate();

			filters.date = {
				$gte: initialDate,
				$lte: finalDate,
			};
		}

		const pointOfSale = await this.pointOfSalesService.findById(pointOfSaleId);

		if (!pointOfSale) {
			throw new Error('El punto de venta no existe');
		}

		filters.pointOfSale = pointOfSale._id;

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.dailyClosingModel.paginate(filters, options);
	}
}

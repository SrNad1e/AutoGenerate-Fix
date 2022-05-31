import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { ExpensesService } from 'src/treasury/services/expenses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateCloseXInvoicingInput } from '../dtos/create-close-x-invoicing-input';
import { FiltersClosesXInvoicingInput } from '../dtos/filters-closes-x-invoicing-input';
import { CloseXInvoicing } from '../entities/close-x-invoicing.entity';
import { OrdersService } from './orders.service';
import { PointOfSalesService } from './point-of-sales.service';

const populate: PopulateOptions[] = [
	{
		path: 'pointOfSale',
		populate: [
			{
				path: 'authorization',
				model: 'AuthorizationDian',
			},
			{
				path: 'shop',
				model: 'Shop',
			},
		],
	},
	{
		path: 'payments',
		populate: {
			path: 'payment',
			model: 'Payment',
		},
	},
];

@Injectable()
export class ClosesXInvoicingService {
	constructor(
		@InjectModel(CloseXInvoicing.name)
		private readonly closeXInvoicingModel: PaginateModel<CloseXInvoicing>,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly ordersService: OrdersService,
		private readonly expensessService: ExpensesService,
	) {}

	async findAll(
		{
			closeDate,
			number,
			shopId,
			sort,
			limit = 10,
			page = 1,
		}: FiltersClosesXInvoicingInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<CloseXInvoicing> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (closeDate) {
			filters.closeDate = new Date(closeDate);
		}

		if (number) {
			filters.number = number;
		}

		if (shopId) {
			const pointOfSales = await this.pointOfSalesService.findAll(
				{ shopId },
				user,
				companyId,
			);

			if (pointOfSales?.docs?.length > 0) {
				const ids = pointOfSales?.docs?.map(
					(pointOfSale) => new Types.ObjectId(pointOfSale._id),
				);

				filters.pointOfSale = { $in: ids };
			} else {
				filters.pointOfSale = '';
			}
		}
		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};
		return this.closeXInvoicingModel.paginate(filters, options);
	}

	async create(
		{
			cashRegister,
			closeDate,
			pointOfSaleId,
			quantityBank,
		}: CreateCloseXInvoicingInput,
		user: User,
		companyId: string,
	) {
		const pointOfSale = await this.pointOfSalesService.findById(pointOfSaleId);

		if (!pointOfSale) {
			throw new NotFoundException('El punto de venta no existe');
		}

		const summaryOrder = await this.ordersService.getSummaryOrder(
			closeDate,
			pointOfSaleId,
		);

		const dateInitial = dayjs(closeDate).format('YYYY/MM/DD');
		const dateFinal = dayjs(closeDate).add(1, 'd').format('YYYY/MM/DD');

		const expenses = await this.expensessService.findAll(
			{
				status: 'active',
				limit: 200,
				boxId: pointOfSaleId,
				dateInitial,
				dateFinal,
			},
			user,
			companyId,
		);

		const closeX = await this.closeXInvoicingModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			})
			.lean();

		const number = (closeX?.number || 0) + 1;

		const newClose = new this.closeXInvoicingModel({
			cashRegister: cashRegister,
			number,
			company: new Types.ObjectId(companyId),
			pointOfSale: pointOfSale._id,
			expenses: expenses?.docs?.map((expense) => expense?._id) || [],
			closeDate: new Date(closeDate),
			quantityBank,
			...summaryOrder,
			user,
		});

		const response = await (await newClose.save()).populate(populate);

		return {
			...response['_doc'],
			pointOfSale: {
				...response?.pointOfSale['_doc'],
				authorization: response?.pointOfSale['authorization']._doc,
			},
		};
	}
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { ExpensesService } from 'src/treasury/services/expenses.service';
import { FiltersClosesZInvoicingInput } from '../dtos/filters-closes-z-invoicing-input';
import { CloseZInvoicing } from '../entities/close-z-invoicing.entity';
import { OrdersService } from './orders.service';
import { PointOfSalesService } from './point-of-sales.service';
import { CreateCloseXInvoicingInput } from '../dtos/create-close-x-invoicing-input';
import { User } from 'src/configurations/entities/user.entity';
import { Expense, StatusExpense } from 'src/treasury/entities/expense.entity';
import { ReceiptsService } from 'src/treasury/services/receipts.service';
import { StatusReceipt } from 'src/treasury/entities/receipt.entity';
import { PaymentOrderClose } from '../entities/close-x-invoicing.entity';
import { BoxService } from 'src/treasury/services/box.service';

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
	{
		path: 'expenses',
		model: Expense.name,
	},
];

@Injectable()
export class ClosesZinvoicingService {
	constructor(
		@InjectModel(CloseZInvoicing.name)
		private readonly closeZInvoicingModel: PaginateModel<CloseZInvoicing>,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly ordersService: OrdersService,
		private readonly expensesService: ExpensesService,
		private readonly receiptsService: ReceiptsService,
		private readonly boxesService: BoxService,
	) {}

	async findAll(
		{
			closeDate,
			number,
			shopId,
			sort,
			limit = 10,
			page = 1,
		}: FiltersClosesZInvoicingInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<CloseZInvoicing> = {};

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
		return this.closeZInvoicingModel.paginate(filters, options);
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

		if (dayjs(closeDate) <= dayjs(pointOfSale?.closeDate)) {
			throw new NotFoundException(
				`El punto de venta se encuentra cerrado para el día ${dayjs(
					pointOfSale?.closeDate,
				).format('DD/MM/YYYY')}`,
			);
		}

		const summaryOrder = await this.ordersService.getSummaryOrder(
			closeDate,
			pointOfSaleId,
		);

		const dateInitial = dayjs(closeDate).format('YYYY/MM/DD');
		const dateFinal = dayjs(closeDate).add(1, 'd').format('YYYY/MM/DD');

		const expenses = await this.expensesService.findAll(
			{
				status: StatusExpense.ACTIVE,
				limit: 200,
				boxId: pointOfSaleId,
				dateInitial,
				dateFinal,
			},
			user,
			companyId,
		);

		const closeZ = await this.closeZInvoicingModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			})
			.lean();

		const number = (closeZ?.number || 0) + 1;

		const receipts = await this.receiptsService.findAll(
			{
				status: StatusReceipt.ACTIVE,
				limit: 200,
				pointOfSaleId: pointOfSale._id.toString(),
				dateInitial,
				dateFinal,
			},
			user,
			companyId,
		);

		const payments: PaymentOrderClose[] = [];

		receipts.docs.forEach((receipt) => {
			const paymentIndex = payments.findIndex(
				(item) => item.payment.toString() === receipt.payment._id.toString(),
			);

			if (paymentIndex >= 0) {
				payments[paymentIndex] = {
					...payments[paymentIndex],
					quantity: payments[paymentIndex].quantity + 1,
					value: payments[paymentIndex].value + receipt.value,
				};
			} else {
				payments.push({
					payment: receipt.payment._id,
					quantity: 1,
					value: receipt.value,
				});
			}
		});

		const newClose = new this.closeZInvoicingModel({
			cashRegister: cashRegister,
			number,
			company: new Types.ObjectId(companyId),
			pointOfSale: pointOfSale._id,
			expenses: expenses?.docs?.map((expense) => expense?._id) || [],
			closeDate: new Date(closeDate),
			quantityBank,
			...summaryOrder,
			payments,
			user,
		});

		const response = await (await newClose.save()).populate(populate);

		if (response?._id) {
			await this.pointOfSalesService.update(
				pointOfSaleId,
				{
					closeDate,
				},
				user,
				companyId,
			);

			const boxMain = await this.boxesService.findOne(
				{
					isMain: true,
				},
				companyId,
			);

			const cash = Object.keys(cashRegister)
				.map((key) => parseInt(key.slice(1)) * cashRegister[key])
				.reduce((sum, item) => sum + item, 0);

			const total = boxMain.total + cash;
			await this.boxesService.updateTotal(boxMain._id.toString(), total);

			const box = await this.boxesService.findById(
				pointOfSale.box._id.toString(),
			);

			const totalBox = box.total - cash;
			await this.boxesService.updateTotal(box._id.toString(), totalBox);
		}

		return {
			...response['_doc'],
			pointOfSale: {
				...response?.pointOfSale['_doc'],
				authorization: response?.pointOfSale['authorization']._doc,
			},
		};
	}
}

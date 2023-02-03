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
import { BoxService } from 'src/treasury/services/box.service';
import { ErrorsCashService } from 'src/treasury/services/errors-cash.service';
import { TypeErrorCash } from 'src/treasury/entities/error-cash.entity';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { ReturnsOrderService } from './returns-order.service';

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
		path: 'paymentsCredit',
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
		private readonly errorsCashService: ErrorsCashService,
		private readonly returnsOrderService: ReturnsOrderService,
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
			filters.closeDate = {
				$gte: new Date(dayjs(closeDate).format('YYYY/MM/DD')),
				$lt: new Date(dayjs(closeDate).add(1, 'd').format('YYYY/MM/DD')),
			};
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

		if (
			dayjs(closeDate).format('YYYY/MM/DD') ===
			dayjs(pointOfSale?.closeDate).format('YYYY/MM/DD')
		) {
			throw new NotFoundException(
				`El punto de venta se encuentra cerrado para el día ${dayjs(
					pointOfSale?.closeDate,
				).format('DD/MM/YYYY')}`,
			);
		}

		/*if (pointOfSale.closing) {
			throw new NotFoundException(
				'El punto de venta se encuentra en proceso de cierre, espere unos minutos y revise el listado',
			);
		}*/

		await this.pointOfSalesService.update(
			pointOfSaleId,
			{
				closing: true,
			},
			user,
			companyId,
		);

		const closeZOld = await this.closeZInvoicingModel.findOne({
			closeDate: new Date(dayjs(closeDate).format('YYYY/MM/DD')),
			pointOfSale: pointOfSale._id,
		});

		if (closeZOld) {
			throw new NotFoundException(`El cierre ya se encuentra registrado`);
		}

		const summaryOrder = await this.ordersService.getSummaryOrder(
			closeDate?.split(' ')[0],
			pointOfSaleId,
		);

		const dateInitial = dayjs(closeDate?.split(' ')[0]).format('YYYY/MM/DD');
		const dateFinal = dayjs(closeDate?.split(' ')[0])
			.add(1, 'd')
			.format('YYYY/MM/DD');

		const expenses = await this.expensesService.findAll(
			{
				status: StatusExpense.ACTIVE,
				limit: 200,
				boxId: pointOfSale.box._id.toString(),
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

		const payments = await this.receiptsService.getPaymentsNoCredit(
			dateInitial,
			dateFinal,
			pointOfSale._id.toString(),
		);

		const refunds = await this.returnsOrderService.resumeDay({
			pointOfSaleId: pointOfSale._id.toString(),
			dateFinal,
			dateInitial,
		});

		const paymentsCredit = await this.receiptsService.getPaymentsCredit(
			dateInitial,
			dateFinal,
			pointOfSale._id.toString(),
		);

		const paymentsOrder = await this.ordersService.getPaymentsOrder({
			dateInitial,
			dateFinal,
			pointOfSaleId: pointOfSale._id.toString(),
		});

		const paymentsCoupons = paymentsOrder.filter(
			(p) =>
				!payments.find(
					(pay) => pay.payment.toString() === p.payment.toString(),
				),
		);

		const newPayments = payments.concat(paymentsCoupons);

		const newClose = new this.closeZInvoicingModel({
			cashRegister: cashRegister,
			number,
			paymentsCredit,
			company: new Types.ObjectId(companyId),
			pointOfSale: pointOfSale._id,
			expenses: expenses?.docs?.map((expense) => expense?._id) || [],
			closeDate: new Date(closeDate.split(' ')[0]),
			quantityBank,
			...summaryOrder,
			refunds,
			payments: newPayments,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		const response = await (await newClose.save()).populate(populate);

		if (response?._id) {
			await this.pointOfSalesService.update(
				pointOfSaleId,
				{
					closeDate: dayjs(closeDate).format('YYYY/MM/DD'),
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

			const box = await this.boxesService.findById(
				pointOfSale.box._id.toString(),
			);

			const totalCash = payments.reduce(
				(sum, item) =>
					item.payment['type'] === TypePayment.CASH
						? sum + item.value
						: sum + 0,
				0,
			);

			const totalcashCredits = paymentsCredit.reduce(
				(sum, item) =>
					item.payment['type'] === TypePayment.CASH
						? sum + item.value
						: sum + 0,
				0,
			);

			const diff = totalCash - cash - totalcashCredits;

			const total = boxMain?.total + cash - diff;

			await this.boxesService.updateTotal(boxMain._id.toString(), total);

			const totalBox = box.total - cash;

			//se valida el cierre si hay cierres y se crea el registro de los errores

			if (totalBox > 0) {
				await this.errorsCashService.addRegister(
					{
						closeZId: response?._id?.toString(),
						typeError: TypeErrorCash.MISSING,
						value: totalBox,
					},
					user,
					companyId,
				);
			}

			if (totalBox < 0) {
				await this.errorsCashService.addRegister(
					{
						closeZId: response?._id?.toString(),
						typeError: TypeErrorCash.SURPLUS,
						value: totalBox * -1,
					},
					user,
					companyId,
				);
			}

			await this.boxesService.updateTotal(box._id.toString(), 0);
		} else {
			await this.pointOfSalesService.update(
				pointOfSaleId,
				{
					closing: false,
				},
				user,
				companyId,
			);
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

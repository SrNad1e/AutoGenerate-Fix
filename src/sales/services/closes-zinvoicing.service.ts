import { CloseZInvoicingNumber } from './../entities/close-z-invoicing-number.entity';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { ExpensesService } from 'src/treasury/services/expenses.service';
import { FiltersClosesZInvoicingInput } from '../dtos/filters-closes-z-invoicing-input';
import { CloseZInvoicing, VerifiedClose } from '../entities/close-z-invoicing.entity';
import { OrdersService } from './orders.service';
import { PointOfSalesService } from './point-of-sales.service';
import { User } from 'src/configurations/entities/user.entity';
import { Expense, StatusExpense } from 'src/treasury/entities/expense.entity';
import { ReceiptsService } from 'src/treasury/services/receipts.service';
import { BoxService } from 'src/treasury/services/box.service';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { ReturnsOrderService } from './returns-order.service';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';
import { CreateCloseZInvoicingInput } from '../dtos/create-close-z-invoicing-input';
import { VerifiedCloseZInput } from '../dtos/verified-close-z-input';

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
		@InjectModel(CloseZInvoicingNumber.name)
		private readonly closeZInvoicingNumberModel: PaginateModel<CloseZInvoicingNumber>,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly ordersService: OrdersService,
		private readonly expensesService: ExpensesService,
		private readonly receiptsService: ReceiptsService,
		private readonly boxesService: BoxService,
		private readonly returnsOrderService: ReturnsOrderService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) { }

	async findAll(
		{
			verifiedStatus,
			value,
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

		if (user.username !== this.configService.USER_ADMIN) {
			filters.company = new Types.ObjectId(companyId);
		}

		if (verifiedStatus) {
			filters.verifiedStatus = VerifiedClose[verifiedStatus];
		}

		if (value === 0 || value > 0) {
			filters['summaryOrder.value'] = value
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
				{
					shopId,
				},
				user,
				companyId,
			);

			if (pointOfSales?.docs?.length > 0) {
				const ids = pointOfSales?.docs?.map(
					(pointOfSale) => new Types.ObjectId(pointOfSale._id),
				);

				filters.pointOfSale = {
					$in: ids,
				};
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
			quantityDataphone
		}: CreateCloseZInvoicingInput,
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

		// validar si hay movimientos del dia despues al dia del cierre

		const orders = await this.ordersService.findAll(
			{
				dateInitial: dayjs(closeDate).subtract(1, 'd').format('YYYY/MM/DD'),
				dateFinal: dayjs(closeDate).subtract(1, 'd').format('YYYY/MM/DD'),
				shopId: pointOfSale?.shop?._id.toString(),
				limit: 1,
				page: 1,
			},
			user,
			companyId,
		);

		if (
			orders.totalDocs > 0 &&
			dayjs(pointOfSale?.closeDate).isAfter(dayjs(closeDate).subtract(1, 'd'))
		) {
			throw new NotFoundException(
				`Hay cierres pendientes por realizar, debe cerrarlos para continuar con el proceso `,
			);
		}

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

		const number = await this.getCloseZNumber(
			pointOfSale?.authorization['prefix'],
			companyId,
		);

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
			prefix: pointOfSale?.authorization['prefix'],
			quantityBank,
			quantityDataphone,
			...summaryOrder,
			refunds,
			payments: newPayments,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			verifiedStatus: 'unverified'
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

		await this.updateCloseZNumber(
			pointOfSale?.authorization['prefix'],
			companyId,
		);

		return {
			...response['_doc'],
			pointOfSale: {
				...response?.pointOfSale['_doc'],
				authorization: response?.pointOfSale['authorization']._doc,
			},
		};
	}

	async getCloseZNumber(prefix: string, companyId: string) {
		const closeZNumber = await this.closeZInvoicingNumberModel.findOne({
			company: new Types.ObjectId(companyId),
			prefix,
		});

		if (!closeZNumber) {
			throw new BadRequestException(
				'El prefijo del cierre no existe, por favor comuníquese con el administrador',
			);
		}

		return closeZNumber.lastNumber + 1;
	}

	async createCloseZNumber(prefix: string, companyId: string) {
		const closeZNumber = await this.closeZInvoicingNumberModel.findOne({
			company: new Types.ObjectId(companyId),
			prefix,
		});

		if (closeZNumber) {
			throw new BadRequestException(
				'Ya existe una numeración de cierre Z con el mismo prefijo',
			);
		}

		return this.closeZInvoicingNumberModel.create({
			company: new Types.ObjectId(companyId),
			prefix,
		});
	}

	async updateCloseZNumber(prefix: string, companyId: string) {
		const closeZNumber = await this.closeZInvoicingNumberModel.findOne({
			company: new Types.ObjectId(companyId),
			prefix,
		});

		if (!closeZNumber) {
			throw new BadRequestException(
				'El prefijo del cierre no existe, por favor comuníquese con el administrador',
			);
		}

		closeZNumber.lastNumber += 1;

		return closeZNumber.save();
	}

	async verifiedClose({ closeZId, verifiedStatus }: VerifiedCloseZInput) {
		return this.closeZInvoicingModel.findByIdAndUpdate(closeZId, {
			$set: {
				verifiedStatus
			}
		})
	}
}

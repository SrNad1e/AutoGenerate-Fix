import { SummaryInvoice, PaymentInvoice } from './../entities/invoice.entity';
import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { ShopsService } from 'src/configurations/services/shops.service';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { CreateInvoiceInput } from '../dtos/create-invoice-input';
import { DataGenerateInvoicesInput } from '../dtos/data-generate-invoices.input';
import { FiltersInvoicesInput } from '../dtos/filters-invoices.input';
import { Invoice } from '../entities/invoice.entity';
import { Order } from '../entities/order.entity';
import { PointOfSalesService } from './point-of-sales.service';
import { AuthorizationsService } from './authorizations.service';
import { ResponseInvoicing } from '../dtos/response-invoicing';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

require('dayjs/locale/es-mx');

const populate = [
	{
		path: 'company',
		model: 'Company',
	},
];

@Injectable()
export class InvoicesService {
	constructor(
		@InjectModel(Invoice.name)
		private readonly invoiceModel: PaginateModel<Invoice>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly shopsService: ShopsService,
		private readonly authorizationsService: AuthorizationsService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	async findAll(
		{
			sort,
			active,
			limit = 20,
			page = 1,
			dateFinal,
			dateInitial,
			pointOfSaleId,
		}: FiltersInvoicesInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Invoice> = {};
		if (user.username !== this.configService.USER_ADMIN) {
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

		if (pointOfSaleId) {
			const pointOfSale = await this.pointOfSalesService.findById(
				pointOfSaleId,
			);

			if (pointOfSale) {
				filters['authorization._id'] = pointOfSale?.authorization?._id;
			}
		}

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.invoiceModel.paginate(filters, options);
	}

	async findById(id: string, user: User, companyId: string) {
		const filters: FilterQuery<Invoice> = {};

		if (user.username !== this.configService.USER_ADMIN) {
			filters.company = new Types.ObjectId(companyId);
		}

		filters._id = new Types.ObjectId(id);

		return this.invoiceModel.findOne(filters);
	}

	async create(
		{ orderId, pointOfSaleId }: CreateInvoiceInput,
		user: User,
		invoiceNumber?: number,
	) {
		const order = await this.orderModel.findById(orderId);
		if (!order) {
			throw new BadRequestException('La orden de venta no existe');
		}

		const pointOfSale = await this.pointOfSalesService.findById(
			order?.pointOfSale?.toString() || pointOfSaleId,
		);

		//generar iva para las facturas

		const subtotal = order.summary.subtotal / 1.19;

		const tax = order.summary.subtotal - subtotal;

		const summary: SummaryInvoice = {
			total: order.summary.total,
			change: order.summary.change,
			subtotal,
			tax,
			discount: order.summary.discount,
			totalPaid: order.summary.totalPaid,
		};

		const payments: PaymentInvoice[] = order.payments.map((payment) => ({
			payment: payment.payment,
			total: payment.total,
		}));

		const autorization = await this.authorizationsService.findById(
			pointOfSale.authorization._id.toString(),
		);

		const details = order.details.map((detail) => {
			const tax = detail.price / 1.19;
			return { ...detail, tax };
		});

		const invoice = new this.invoiceModel({
			authorization: autorization,
			number: invoiceNumber ? invoiceNumber : autorization.lastNumber + 1,
			customer: order.customer,
			company: order.company,
			shop: order.shop,
			payments,
			summary,
			order: order._id,
			details,
			user: user || order.user,
			createdAt: order.closeDate,
		});

		return invoice.save();
	}

	async generateInvoices({
		cash,
		dateFinal,
		dateInitial,
		shopId,
	}: DataGenerateInvoicesInput): Promise<ResponseInvoicing> {
		const finalDate = dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD');
		const initialDate = dayjs(dateInitial).format('YYYY/MM/DD');

		//validar rangos de fecha
		if (dayjs(finalDate).isBefore(dateInitial)) {
			throw new BadRequestException(
				'La fecha final no puede ser menor a la fecha inicial',
			);
		}
		const shop = await this.shopsService.findById(shopId);

		//validar la tienda
		if (!shop) {
			throw new BadRequestException('La tienda no existe');
		}

		//Peso de dia a dia con respecto a la venta total
		let totalOrdersDay = await this.orderModel.aggregate([
			{
				$match: {
					closeDate: {
						$gte: new Date(initialDate),
						$lt: new Date(finalDate),
					},
					'shop._id': new Types.ObjectId(shopId),
					status: 'closed',
					'payments.payment.type': TypePayment.CASH,
				},
			},
			{
				$group: {
					_id: {
						$dayOfMonth: '$closeDate',
					},
					total: {
						$sum: '$summary.total',
					},
					number: {
						$first: '$number',
					},
				},
			},
			{
				$project: {
					_id: 0,
					day: '$_id',
					total: 1,
					number: 1,
				},
			},
			{
				$sort: {
					day: 1,
				},
			},
		]);

		//calcular valor correspondiente al día dependiendo del peso
		const totalSales = totalOrdersDay.reduce(
			(sum, item) => sum + item.total,
			0,
		);

		totalOrdersDay = totalOrdersDay.map((item) => {
			const weight = item.total / totalSales;
			const cashTotal = cash * weight;

			return {
				...item,
				weight,
				cashTotal,
			};
		});

		const pointOfSales = await this.pointOfSalesService.findAll(
			{
				shopId,
			},
			{
				username: this.configService.USER_ADMIN,
			} as User,
			'',
		);

		const autorization = await this.authorizationsService.findById(
			pointOfSales.docs[0]?.authorization?._id.toString(),
		);

		//validar la autorización si tiene numeración, si esta vencida
		if (!autorization) {
			throw new BadRequestException('La autorización no existe');
		}

		if (autorization.numberFinal <= autorization.lastNumber) {
			throw new BadRequestException(
				'La autorización no tiene números disponibles',
			);
		}

		if (dayjs(autorization.dateFinal).endOf('d').isBefore(dayjs(dateFinal))) {
			throw new BadRequestException(
				'La autorización no esta vigente para la fecha final',
			);
		}

		if (dayjs(autorization.lastDateInvoicing).isAfter(dayjs(dateInitial))) {
			throw new BadRequestException(
				'En el rango hay fechas ya facturadas, intente nuevamenta',
			);
		}

		//obtener los pedidos día a dia que se van a facturar
		let invoiceQuantityBank = 0;
		let invoiceQuantityCash = 0;
		let valueInvoicingBank = 0;
		let currentNumber = autorization.lastNumber + 1;

		for (let i = 0; i < totalOrdersDay.length; i++) {
			const { day, cashTotal } = totalOrdersDay[i];

			const di = dayjs(initialDate)
				.startOf('month')
				.add(day - 1, 'd');

			const dI = di.format('YYYY/MM/DD');

			const dF = di.add(1, 'd').format('YYYY/MM/DD');

			const orders = await this.orderModel.aggregate([
				{
					$match: {
						closeDate: {
							$gte: new Date(dI),
							$lt: new Date(dF),
						},
						'shop._id': new Types.ObjectId(shopId),
						status: 'closed',
						'payments.payment.type': {
							$not: {
								$in: [TypePayment.CREDIT, TypePayment.BANK, TypePayment.BONUS],
							},
						},
					},
				},
				{
					$project: {
						_id: 1,
						total: '$summary.total',
						closeDate: 1,
					},
				},
			]);

			const ordersBank = await this.orderModel.aggregate([
				{
					$match: {
						closeDate: {
							$gte: new Date(dI),
							$lt: new Date(dF),
						},
						'shop._id': new Types.ObjectId(shopId),
						status: 'closed',
						'payments.payment.type': TypePayment.BANK,
					},
				},
				{
					$project: {
						_id: 1,
						total: '$summary.total',
						closeDate: 1,
					},
				},
			]);

			let total = 0;
			let ordersInvoicing = [];
			let posUp = 0;
			let posDown = orders.length - 1;

			while (total < cashTotal && posUp < posDown - 1) {
				let order = orders[posUp];
				total += order.total;
				ordersInvoicing.push({
					orderId: order._id.toString(),
					closeDate: order.closeDate,
				});
				posUp++;
				if (total < cashTotal) {
					order = orders[posDown];
					total += order.total;
					ordersInvoicing.push({
						orderId: order._id.toString(),
						closeDate: order.closeDate,
					});
					posDown--;
				} else {
					break;
				}
			}

			invoiceQuantityCash += ordersInvoicing.length;

			ordersInvoicing = ordersInvoicing.concat(
				ordersBank.map(({ _id, closeDate }) => ({
					orderId: _id.toString(),
					closeDate: closeDate,
				})),
			);

			valueInvoicingBank =
				valueInvoicingBank +
				ordersBank.reduce((sum, order) => sum + order.total, 0);

			invoiceQuantityBank = invoiceQuantityBank + ordersBank.length;

			//ordenar por fecha

			ordersInvoicing.sort((a, b) => {
				if (dayjs(a.closeDate).isAfter(dayjs(b.closeDate))) {
					return 1;
				}
				if (dayjs(a.closeDate).isBefore(dayjs(b.closeDate))) {
					return -1;
				}
				return 0;
			});

			//generar factura de los pedidos en efectivo
			for (let i = 0; i < ordersInvoicing.length; i++) {
				const { orderId } = ordersInvoicing[i];

				await this.create(
					{ orderId, pointOfSaleId: pointOfSales?.docs[0]?._id?.toString() },
					{ username: this.configService.USER_ADMIN } as User,
					currentNumber,
				);

				currentNumber++;
			}
		}
		await this.authorizationsService.update(
			autorization._id.toString(),
			{
				lastNumber: currentNumber - 1,
				lastDateInvoicing: new Date(finalDate),
			},
			{ username: this.configService.USER_ADMIN } as User,
			shop.company.toString(),
		);
		return {
			invoiceQuantityCash,
			invoiceQuantityBank,
			valueInvoicingBank,
			valueInvoicingCash: cash,
		};
	}
}

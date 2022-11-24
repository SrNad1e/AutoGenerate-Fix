import {
	SummaryInvoice,
	DetailInvoice,
	PaymentInvoice,
} from './../entities/invoice.entity';
import {
	DetailInvoiceInput,
	PaymentInvoiceInput,
} from './../dtos/create-invoice-input';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { ShopsService } from 'src/configurations/services/shops.service';
import { CustomersService } from 'src/crm/services/customers.service';
import { ProductsService } from 'src/products/services/products.service';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { PaymentsService } from 'src/treasury/services/payments.service';
import { CreateInvoiceInput } from '../dtos/create-invoice-input';
import { DataGenerateInvoicesInput } from '../dtos/data-generate-invoices.input';
import { FiltersInvoicesInput } from '../dtos/filters-invoices.input';
import { Invoice } from '../entities/invoice.entity';
import { Order } from '../entities/order.entity';
import { PointOfSalesService } from './point-of-sales.service';
import { AuthorizationsService } from './authorizations.service';

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
	) {}

	async findAll(
		{
			sort,
			active,
			limit = 20,
			page = 1,
			dateFinal,
			dateInitial,
		}: FiltersInvoicesInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Invoice> = {};
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

		return this.invoiceModel.paginate(filters, options);
	}

	async create({ orderId }: CreateInvoiceInput, user: User) {
		const order = await this.orderModel.findById(orderId);
		if (!order) {
			throw new BadRequestException('La orden de venta no existe');
		}

		const pointOfSale = await this.pointOfSalesService.findById(
			order?.pointOfSale.toString(),
		);

		const summary: SummaryInvoice = {
			total: order.summary.total,
			change: order.summary.change,
			subtotal: order.summary.subtotal,
			tax: order.summary.tax,
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

		const invoice = new this.invoiceModel({
			authorization: autorization,
			number: autorization.numberCurrent + 1,
			customer: order.customer,
			company: order.company,
			shop: order.shop,
			payments,
			summary,
			details: order.details,
			user: order.user,
			createdAt: order.closeDate,
		});

		await this.authorizationsService.update(
			autorization._id.toString(),
			{ numberCurrent: autorization.numberCurrent + 1 },
			user,
			order.company.toString(),
		);

		return invoice.save();
	}

	async generateInvoices({
		cash,
		dateFinal,
		dateInitial,
		shopId,
	}: DataGenerateInvoicesInput) {
		const finalDate = dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD');
		const finalInitial = dayjs(dateInitial).format('YYYY/MM/DD');

		//validar rangos de fecha
		if (dayjs(finalDate).isBefore(finalInitial)) {
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
						$gte: new Date(dateInitial),
						$lte: new Date(dateFinal),
					},
					'shop._id': new Types.ObjectId(shopId),
					status: 'closed',
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
				},
			},
			{
				$project: {
					_id: 0,
					day: '$_id',
					total: 1,
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

		//obtener los pedidos día a dia que se van a facturar

		let invoiceQuantity = 0;
		let valueMissing = 0;
		for (let i = 0; i < totalOrdersDay.length; i++) {
			const { day, cashTotal } = totalOrdersDay[i];

			const orders = await this.orderModel
				.find({
					closeDate: {
						$gte: new Date(
							dayjs(dateInitial)
								.add(day - 1, 'd')
								.format('YYYY/MM/DD'),
						),
						$lte: new Date(
							dayjs(dateInitial)
								.add(day - 1, 'd')
								.format('YYYY/MM/DD'),
						),
					},
					'shop._id': new Types.ObjectId('6331b982aa2af68a4ecad2ed'),
					status: 'closed',
					'payments.payment.type': {
						$not: {
							$in: [TypePayment.CREDIT, TypePayment.BANK, TypePayment.BONUS],
						},
					},
				})
				.projection({
					_id: 1,
					total: 'summary.total',
					closeDate: 1,
					customerId: '$customer._id',
					details: 1,
					pointOfSaleId: '$pointOfSale',
				});

			let total = 0;
			const ordersInvoicing = [];
			let posUp = 0;
			let posDown = orders.length - 1;

			while (total < cashTotal && posUp < posDown - 1) {
				let order = orders[posUp];
				total += order.total;
				ordersInvoicing.push(order._id.toString());
				posUp++;
				if (total < cashTotal) {
					order = orders[posDown];
					total += order.total;
					ordersInvoicing.push(order._id.toString());
					posDown--;
				} else {
					if (total > cashTotal) {
						total -= order.total;
						ordersInvoicing.pop();
					}
					break;
				}
			}

			if (total < cashTotal) {
				valueMissing += cashTotal - total;
			}

			//generar factura de los pedidos
			for (let i = 0; i < ordersInvoicing.length; i++) {
				const orderId = ordersInvoicing[i];
				await this.create({ orderId }, { username: 'admin' } as User);
			}

			invoiceQuantity += ordersInvoicing.length;
		}

		return {
			invoiceQuantity,
			valueMissing,
			valueInvoicing: cash - valueMissing,
		};
	}
}

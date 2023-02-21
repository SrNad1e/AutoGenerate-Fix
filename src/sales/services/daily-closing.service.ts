import { CreateDailyClosingInput } from './../dtos/create-daily-closing.input';
import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { FiltersDailyClosing } from '../dtos/filters-daily-closing.input';
import { DailyClosing } from '../entities/dailyClosing';
import { PointOfSalesService } from './point-of-sales.service';
import { InvoicesService } from './invoices.service';
import { GenerateDailyClosingInput } from '../dtos/generate-daily-closing.input';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

const populate: PopulateOptions[] = [
	{
		path: 'company',
		model: 'Company',
	},
	{
		path: 'pointOfSale',
		populate: [
			{
				path: 'shop',
				model: 'Shop',
			},
			{
				path: 'box',
				model: 'Box',
			},
		],
	},
	{
		path: 'invoices',
		populate: {
			path: 'order',
			model: 'Order',
		},
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
		private readonly invoicesService: InvoicesService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
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

		if (user.username !== this.configService.USER_ADMIN) {
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

		if (pointOfSaleId) {
			const pointOfSale = await this.pointOfSalesService.findById(
				pointOfSaleId,
			);

			if (!pointOfSale) {
				throw new Error('El punto de venta no existe');
			}

			filters.pointOfSale = pointOfSale._id;
		}

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.dailyClosingModel.paginate(filters, options);
	}

	async create(
		{ closeDate, invoicesId, pointOfSaleId }: CreateDailyClosingInput,
		user: User,
		companyId: string,
	) {
		const pointOfSale = await this.pointOfSalesService.findById(pointOfSaleId);

		if (!pointOfSale) {
			throw new Error('El punto de venta no existe');
		}

		let summary = {
			total: 0,
			subtotal: 0,
			tax: 0,
		};

		const invoices = [];
		const summaryPayments = [];

		if (invoicesId.length > 0) {
			//validar pedidos
			let total = 0;
			let subtotal = 0;
			let tax = 0;

			for (let i = 0; i < invoicesId.length; i++) {
				const invoiceId = invoicesId[i];
				const invoice = await this.invoicesService.findById(
					invoiceId,
					user,
					companyId,
				);

				if (!invoice) {
					throw new BadRequestException('Una de las facturas no existen');
				}

				total = total + invoice.summary.total;
				subtotal = subtotal + invoice.summary.subtotal;
				tax = tax + invoice.summary.tax;

				invoices.push(invoice._id);

				for (let j = 0; j < invoice.payments.length; j++) {
					const { payment } = invoice.payments[j];

					const paymentIndex = summaryPayments.findIndex(
						(d) => d.payment._id.toString() === payment._id.toString(),
					);

					if (paymentIndex === -1) {
						summaryPayments.push({
							payment: payment._id,
							total: invoice.payments[j].total,
							quantity: 1,
						});
					} else {
						summaryPayments[paymentIndex] = {
							...summaryPayments[paymentIndex],
							total:
								summaryPayments[paymentIndex].total + invoice.payments[j].total,
							quantity: summaryPayments[paymentIndex].quantity + 1,
						};
					}
				}
			}

			summary = {
				total,
				subtotal,
				tax,
			};
		}

		const dailyClosing = new this.dailyClosingModel({
			company: new Types.ObjectId(companyId),
			closeDate: new Date(closeDate),
			pointOfSale: pointOfSale._id,
			invoices,
			summary,
			summaryPayments,
			user,
		});

		return dailyClosing.save();
	}

	/**
	 * @description Genera el cierre diario en rango de fechas
	 * @param datos datos necesarioa para hgenerar el cierre diario
	 * @param user usuario que genera el cierre diario
	 * @param companyId compañia a la que pertenece el cierre diario
	 * @returns objeto de respuesta
	 */
	async generateDailyClosing(
		{ shopId, dateFinal, dateInitial }: GenerateDailyClosingInput,
		user: User,
		companyId: string,
	) {
		const pointOfSalesData = await this.pointOfSalesService.findAll(
			{ shopId, limit: 200, page: 1 },
			user,
			companyId,
		);

		if (pointOfSalesData.docs.length === 0) {
			throw new BadRequestException(
				'No existen puntos de venta para esta tienda',
			);
		}

		//validar cuantos días son

		const days = dayjs(dateFinal).diff(dayjs(dateInitial), 'day');

		for (let j = 0; j < pointOfSalesData.docs.length; j++) {
			const { _id } = pointOfSalesData.docs[j];

			for (let i = 0; i <= days; i++) {
				const date = dayjs(dateInitial).add(i, 'day');

				const invoices = await this.invoicesService.findAll(
					{
						dateInitial: date.format('YYYY/MM/DD'),
						dateFinal: date.format('YYYY/MM/DD'),
						pointOfSaleId: _id.toString(),
						limit: 5000,
						active: true,
					},
					user,
					companyId,
				);

				//generar cierre

				await this.create(
					{
						closeDate: date.format('YYYY/MM/DD'),
						invoicesId: invoices.docs.map((d) => d._id.toString()),
						pointOfSaleId: _id.toString(),
					},
					user,
					companyId,
				);
			}
		}

		return {
			message: 'Cierres diarios generados',
			quantity: (days + 1) * pointOfSalesData.docs.length,
		};
	}
}

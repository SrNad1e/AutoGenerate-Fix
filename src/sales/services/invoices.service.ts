import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { CustomersService } from 'src/crm/services/customers.service';
import { ProductsService } from 'src/products/services/products.service';
import { PaymentsService } from 'src/treasury/services/payments.service';
import { User } from 'src/users/entities/user.entity';
import { CreateInvoiceInput } from '../dtos/create-invoice-input';
import { Invoice } from '../entities/invoice.entity';
import { PointOfSalesService } from './point-of-sales.service';

@Injectable()
export class InvoicesService {
	constructor(
		@InjectModel(Invoice.name)
		private readonly invoiceModel: PaginateModel<Invoice>,
		private readonly customersService: CustomersService,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly paymentsService: PaymentsService,
		private readonly productsService: ProductsService,
	) {}

	async create(
		{ customerId, details, payments }: CreateInvoiceInput,
		user: User,
	) {
		if (!user.pointOfSale) {
			throw new BadRequestException(
				'El usuario no tiene punto de venta asignado',
			);
		}
		const pointOfSale = await this.pointOfSalesService.findById(
			user.pointOfSale._id.toString(),
		);

		if (!pointOfSale) {
			throw new BadRequestException('El punto de venta asignado no existe');
		}

		if (!pointOfSale?.authorization?._id) {
			throw new BadRequestException(
				'Autorización no existe o se encuentra vencida',
			);
		}

		const customer = await this.customersService.findById(customerId);

		if (!customer) {
			throw new BadRequestException('El cliente no existe');
		}

		const newPayments = [];

		for (let i = 0; i < payments.length; i++) {
			const item = payments[i];
			const payment = await this.paymentsService.findById(item.paymentId);

			if (!payment) {
				throw new BadRequestException('Uno de los medios de pago no existe');
			}

			newPayments.push({
				payment,
				total: item.total,
			});
		}

		const newDetails = [];

		for (let i = 0; i < details.length; i++) {
			const item = details[i];

			const product = await this.productsService.findById(item.productId);

			if (!product) {
				throw new BadRequestException('Uno de los productos no existe');
			}

			newDetails.push({
				product,
				quantity: item.quantity,
			});
		}

		let summary = {
			subtotal: details.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0,
			),
			discount: details.reduce(
				(sum, item) => sum + item.discount * item.quantity,
				0,
			),
			tax: 0,
			totalPaid: payments.reduce((sum, item) => sum + item.total, 0),
			total: 0,
			change: 0,
		};

		summary = {
			...summary,
			total: summary.subtotal - summary.discount,
			change: summary.totalPaid - summary.subtotal - summary.discount,
		};

		return this.invoiceModel.create({
			authorization: pointOfSale?.authorization,
			customer,
			shop: user.shop,
			payments: newPayments,
			summary,
			details: newDetails,
			user,
		});
	}
}

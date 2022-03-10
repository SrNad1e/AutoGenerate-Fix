/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { Model } from 'mongoose';

import { Customer } from 'src/customers/entities/customer.entity';
import { InvoicesService } from 'src/invoices/services/invoices.service';

@Injectable()
export class CustomersService {
	constructor(
		@InjectModel(Customer.name) private customerModel: Model<Customer>,
		private invoiceService: InvoicesService,
	) {}

	private readonly logger = new Logger(CustomersService.name);

	/**
	 * @description se encarga de desmarcar al cliente como mayorista
	 * @param customerId identificador del cliente
	 */
	async inactiveWholesale(customerId: string) {
		return this.customerModel.findByIdAndUpdate(customerId, {
			$set: { wholesale: { active: false, activatedAt: new Date() } },
		});
	}

	@Cron('* * 21 * * *')
	async checkWholesales() {
		//consultar clientes que sean mayoristas

		const customers = await this.customerModel.find({
			'wholesale.active': true,
		});

		//seleccionamos los que tengan fecha vencida
		const customersCheck = customers.filter((customer) =>
			moment(customer.wholesale.activatedAt).add(30, 'd').isBefore(moment()),
		);

		//validamos las ventas por cliente por el tiempo
		for (let i = 0; i < customersCheck.length; i++) {
			const customer = customersCheck[i];

			//Validar si es primera compra
			if (customer.wholesale?.lastOrder?.totalPaid >= 300000) {
				await this.customerModel.findByIdAndUpdate(customer._id, {
					$set: { wholesale: { active: true, activatedAt: new Date() } },
				});
			} else {
				const total = await this.invoiceService.totalInvoicesCustomer(
					customer.identification,
					new Date(moment().subtract(30, 'd').format('YYYY/MM/DD')),
					new Date(moment().add(1, 'd').format('YYYY/MM/DD')),
				);

				if (total < 200000) {
					//inactivar al cliente
					await this.inactiveWholesale(customer._id);
				} else {
					//actualizar la fecha de activación
					await this.customerModel.findByIdAndUpdate(customer._id, {
						$set: { wholesale: { active: true, activatedAt: new Date() } },
					});
				}
			}
		}
	}
}

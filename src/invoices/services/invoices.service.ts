/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class InvoicesService {
	constructor(
		@InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
	) {}

	findById(id: string) {
		return this.invoiceModel.findById(id);
	}

	/**
	 * @description se encarga de consultar total de ventas por cliente
	 * @param identification documento del cliente para consultar las ventas
	 * @returns total de ventas de cliente tipo number
	 */
	async totalInvoicesCustomer(identification: string) {
		const total = await this.invoiceModel.aggregate([
			{
				$match: {
					'customer.identification': identification,
				},
			},
			{
				$group: {
					_id: null,
					total: {
						$sum: '$summary.total',
					},
				},
			},
		]);

		return total[0]?.total || 0;
	}
}

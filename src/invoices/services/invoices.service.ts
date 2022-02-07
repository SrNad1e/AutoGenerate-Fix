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
	 * @param dateInitial fecha incial del rango para la consulta
	 * @param dateFinish fecha final del rango para la consulta
	 * @returns total de ventas de cliente tipo number
	 */
	async totalInvoicesCustomer(
		identification: string,
		dateInitial: Date,
		dateFinish: Date,
	) {
		const total = await this.invoiceModel.aggregate([
			{
				$match: {
					'customer.identification': identification,
					createdAt: {
						$gte: dateInitial,
						$lt: dateFinish,
					},
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

	/**
	 * @description se encarga de consultar total de ventas por tienda
	 * @param shopId id de tienda para consultar las ventas
	 * @param dateInitial fecha incial del rango para la consulta
	 * @param dateFinish fecha final del rango para la consulta
	 * @returns total de ventas de cliente tipo number
	 */
	async totalInvoicesShop(shopId: number, dateInitial: Date, dateFinish: Date) {
		const total = await this.invoiceModel.aggregate([
			{
				$match: {
					'shop.shopId': shopId,
					createdAt: {
						$gte: dateInitial,
						$lt: dateFinish,
					},
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
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { ShopsService } from 'src/shops/services/shops.service';
import { Repository } from 'typeorm';

import { Invoice, InvoiceMysql } from '../entities/invoice.entity';

@Injectable()
export class InvoicesService {
	constructor(
		@InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
		@InjectRepository(InvoiceMysql)
		private invoiceRepo: Repository<InvoiceMysql>,
		private shopsService: ShopsService,
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
	s;
	async salesForShop(
		dateInitial: Date,
		dateFinish: Date,
	): Promise<{ shopId: number; total: number }[]> {
		const results = await this.invoiceModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: dateInitial,
						$lt: dateFinish,
					},
				},
			},
			{
				$group: {
					_id: '$shop.shopId',
					total: {
						$sum: '$summary.total',
					},
				},
			},
		]);

		//obtenemos las tiendas
		const shopsIds = (
			await this.shopsService.getAll({ status: 'active' })
		).data.map((shop) => shop.shopId);

		let resultsOld;
		if (dateInitial.getFullYear() < 2022) {
			resultsOld = await this.invoiceRepo.query(
				'SELECT shop_id as shopId, SUM(total) AS total FROM invoices WHERE state = 2 AND created_at >= ? AND created_at < ? GROUP BY shop_id',
				[
					moment(dateInitial).format('YYYY-MM-DD'),
					moment(dateFinish).format('YYYY-MM-DD'),
				],
			);
		}
		const sent = await shopsIds.map((shopId) => {
			const totalOld =
				resultsOld?.find((dato) => dato.shopId === shopId)?.total || '0';

			const total = results.find((dato) => dato._id === shopId)?.total || '0';

			return { shopId, total: total + parseFloat(totalOld) };
		});
		return sent;
	}
}

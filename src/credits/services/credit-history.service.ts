import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregatePaginateModel } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Order } from 'src/sales/entities/order.entity';
import {
	CreditHistory,
	TypeCreditHistory,
} from '../entities/credit-history.entity';
import { CreditsService } from './credits.service';

@Injectable()
export class CreditHistoryService {
	constructor(
		@InjectModel(CreditHistory.name)
		private readonly creditHistoryModel: AggregatePaginateModel<CreditHistory>,
		@InjectModel(Order.name)
		private readonly orderModel: AggregatePaginateModel<Order>,
		private readonly creditsService: CreditsService,
	) {}

	async addCreditHistory(
		orderId: string,
		amount: number,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}

		const credit = await this.creditsService.validateCredit(
			order?.customer?._id?.toString(),
			amount,
			TypeCreditHistory.CREDIT,
		);

		const newCredit = await this.creditsService.update(
			credit?._id.toString(),
			{
				amount,
				detailAddCredit: {
					orderId: order?._id.toString(),
					total: amount,
					type: TypeCreditHistory.CREDIT,
				},
			},
			user,
			companyId,
		);

		const newCreditHistory = new this.creditHistoryModel({
			type: TypeCreditHistory.CREDIT,
			amount,
			credit: newCredit,
			user,
		});

		return newCreditHistory.save();
	}

	async deleteCreditHistory(
		orderId: string,
		amount: number,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}

		const credit = await this.creditsService.validateCredit(
			order?.customer?._id?.toString(),
			amount,
			TypeCreditHistory.DEBIT,
		);

		const newCredit = await this.creditsService.update(
			credit?._id.toString(),
			{
				amount,
				detailAddCredit: {
					orderId: order?._id.toString(),
					total: amount,
					type: TypeCreditHistory.DEBIT,
				},
			},
			user,
			companyId,
		);

		const newCreditHistory = new this.creditHistoryModel({
			type: TypeCreditHistory.DEBIT,
			amount,
			credit: newCredit,
			user,
		});

		return newCreditHistory.save();
	}

	async frozenCreditHistory(
		orderId: string,
		amount: number,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}

		const credit = await this.creditsService.validateCredit(
			order?.customer.toString(),
			amount,
			TypeCreditHistory.CREDIT,
		);

		const newCredit = await this.creditsService.update(
			credit?._id.toString(),
			{
				amount,
				detailAddCredit: {
					orderId: order?._id.toString(),
					total: amount,
					type: TypeCreditHistory.FROZEN,
				},
			},
			user,
			companyId,
		);

		const newCreditHistory = new this.creditHistoryModel({
			type: TypeCreditHistory.FROZEN,
			amount,
			credit: newCredit,
			user,
		});

		return newCreditHistory.save();
	}

	async thawedCreditHistory(
		orderId: string,
		amount: number,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}

		const credit = await this.creditsService.validateCredit(
			order?.customer.toString(),
			amount,
			TypeCreditHistory.THAWED,
		);

		const newCredit = await this.creditsService.update(
			credit?._id.toString(),
			{
				amount,
				detailAddCredit: {
					orderId: order?._id.toString(),
					total: amount,
					type: TypeCreditHistory.THAWED,
				},
			},
			user,
			companyId,
		);

		const newCreditHistory = new this.creditHistoryModel({
			type: TypeCreditHistory.THAWED,
			amount,
			credit: newCredit,
			user,
		});

		return newCreditHistory.save();
	}
}

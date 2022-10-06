import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Order } from 'src/sales/entities/order.entity';
import { FiltersCreditHistoryInput } from '../dtos/filters-creditHistory.input';
import {
	CreditHistory,
	TypeCreditHistory,
} from '../entities/credit-history.entity';
import { CreditsService } from './credits.service';

@Injectable()
export class CreditHistoryService {
	constructor(
		@InjectModel(CreditHistory.name)
		private readonly creditHistoryModel: PaginateModel<CreditHistory>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
		private readonly creditsService: CreditsService,
	) {}

	async findOne(
		{
			amount,
			creditId,
			customerId,
			limit = 10,
			page = 1,
			sort,
			type,
		}: FiltersCreditHistoryInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<CreditHistory> = {};

		if (user?.username !== 'admin') {
			filters['credit.company'] = new Types.ObjectId(companyId);
		}

		if (amount) {
			filters.amount = amount;
		}

		if (creditId) {
			filters['credit._id'] = new Types.ObjectId(creditId);
		}

		if (customerId) {
			filters['credit.customer'] = new Types.ObjectId(customerId);
		}

		if (type) {
			filters.type = TypeCreditHistory[type];
		}

		const options = {
			lean: true,
			sort,
			page,
			limit,
		};

		return this.creditHistoryModel.paginate(filters, options);
	}

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
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
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
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
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
			order?.customer?._id?.toString(),
			amount,
			TypeCreditHistory.FROZEN,
		);

		const newCredit = await this.creditsService.update(
			credit?._id.toString(),
			{
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
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
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
			order?.customer?._id?.toString(),
			amount,
			TypeCreditHistory.THAWED,
		);

		const newCredit = await this.creditsService.update(
			credit?._id.toString(),
			{
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
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		return newCreditHistory.save();
	}
}

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Order } from 'src/sales/entities/order.entity';
import { FiltersCreditHistoryInput } from '../dtos/filters-creditHistory.input';
import {
	CreditHistory,
	TypeCreditHistory,
	TypeDocument,
} from '../entities/credit-history.entity';
import { CreditsService } from './credits.service';
import { Receipt } from 'src/treasury/entities/receipt.entity';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class CreditHistoryService {
	constructor(
		@InjectModel(CreditHistory.name)
		private readonly creditHistoryModel: PaginateModel<CreditHistory>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
		@InjectModel(Receipt.name)
		private readonly receiptModel: PaginateModel<Receipt>,
		private readonly creditsService: CreditsService,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
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

		if (user?.username !== this.configService.USER_ADMIN) {
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
		documentNumber: number,
		typeDocument: TypeDocument,
		orderId: string,
		amount: number,
		user: User,
		companyId: string,
	) {
		const documentType = TypeDocument[typeDocument] || typeDocument;

		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException(`No se encontró el pedido`);
		}

		switch (documentType) {
			case TypeDocument.RECEIPT:
				const receipt = await this.receiptModel.findOne({
					number: documentNumber,
				});

				if (!receipt) {
					throw new NotFoundException(`No se encontró el recibo`);
				}

				break;

			case TypeDocument.ORDER:
				const order = await this.orderModel.findOne({ number: documentNumber });

				if (!order) {
					throw new NotFoundException(`No se encontró el pedido`);
				}

				break;

			default:
				break;
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
			documentNumber,
			documentType,
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
		documentNumber: number,
		typeDocument: TypeDocument,
		orderId: string,
		amount: number,
		user: User,
		companyId: string,
	) {
		const documentType = TypeDocument[typeDocument] || typeDocument;

		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}

		switch (documentType) {
			case TypeDocument.RECEIPT:
				const receipt = await this.receiptModel.findOne({
					number: documentNumber,
				});

				if (!receipt) {
					throw new NotFoundException(`No se encontró el recibo`);
				}

				break;

			case TypeDocument.ORDER:
				const order = await this.orderModel.findOne({ number: documentNumber });

				if (!order) {
					throw new NotFoundException(`No se encontró el pedido`);
				}

				break;

			default:
				break;
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
			documentNumber,
			documentType,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		return newCreditHistory.save();
	}

	async frozenCreditHistory(
		documentNumber: number,
		amount: number,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findOne({
			number: documentNumber,
			company: new Types.ObjectId(companyId),
		});

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
			documentType: TypeDocument.ORDER,
			documentNumber,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		return newCreditHistory.save();
	}

	async thawedCreditHistory(
		documentNumber: number,
		amount: number,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findOne({
			number: documentNumber,
			company: new Types.ObjectId(companyId),
		});

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
			documentNumber,
			documentType: TypeDocument.ORDER,
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

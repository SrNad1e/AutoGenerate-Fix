import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateReceiptInput } from '../dtos/create-receipt.input';
import { Receipt } from '../entities/receipt.entity';
import { BoxHistoryService } from './box-history.service';
import { BoxService } from './box.service';
import { PaymentsService } from './payments.service';

@Injectable()
export class ReceiptsService {
	constructor(
		@InjectModel(Receipt.name)
		private readonly receiptModel: PaginateModel<Receipt>,
		private readonly boxService: BoxService,
		private readonly paymentsService: PaymentsService,
		private readonly boxHistoryService: BoxHistoryService,
	) {}

	async create(
		{ concept, paymentId, value, boxId }: CreateReceiptInput,
		user: User,
		companyId: string,
	) {
		let box;
		if (boxId) {
			box = await this.boxService.findById(boxId);
			if (!box) {
				throw new NotFoundException('La caja no existe');
			}
		}

		const payment = await this.paymentsService.findById(paymentId);

		if (!payment) {
			throw new NotFoundException('El medio de pago no existe');
		}

		const receipt = await this.receiptModel
			.findOne({
				category: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			});

		const number = (receipt?.number || 0) + 1;

		const newReceipt = new this.receiptModel({
			number,
			value,
			concept,
			payment: payment?._id,
			company: companyId,
			user,
		});

		if (boxId) {
			await this.boxHistoryService.addCash(
				{
					boxId,
					documentId: newReceipt?._id.toString(),
					documentType: 'receipt',
					value,
				},
				user,
				companyId,
			);
		}

		return newReceipt.save();
	}
}

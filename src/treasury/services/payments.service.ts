import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentsService {
	constructor(
		@InjectModel(Payment.name)
		private readonly paymentModel: PaginateModel<Payment>,
	) {}

	async findById(id: string) {
		return this.paymentModel.findById(id).lean();
	}
}

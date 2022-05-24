import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { CreateReceiptInput } from '../dtos/create-receipt.input';

import { Receipt } from '../entities/receipt.entity';

@Injectable()
export class ReceiptsService {
	constructor(
		@InjectModel(Receipt.name)
		private readonly receiptModel: PaginateModel<Receipt>,
	) {}

	create({}: CreateReceiptInput) {}
}

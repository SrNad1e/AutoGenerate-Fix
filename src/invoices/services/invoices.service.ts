import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FiltersInvoicesDto } from '../dtos/invoices.dto';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class InvoicesService {
	constructor(
		@InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
	) {}

	findById(id: string) {
		return this.invoiceModel.findById(id);
	}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductReturns } from '../entities/productreturns.entity';

//TODO: pendiente cambiar entidad
@Injectable()
export class RefundsService {
	constructor(
		@InjectModel(ProductReturns.name)
		private productReturnsModel: Model<ProductReturns>,
	) {}
	getAll(data: any) {
		const { limit = 20, skip = 0, order, invoice, shop } = data;
		return this.productReturnsModel.find().limit(limit).exec();
	}
}

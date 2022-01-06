import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersService {
	constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

	findById(id: string) {
		return this.orderModel.findById(id);
	}
}

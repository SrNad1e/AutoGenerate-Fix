import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { CreateStatusWebHistoryInput } from '../dtos/create-status-web-history.input';
import { Order } from '../entities/order.entity';
import { StatusWebHistory } from '../entities/status-web-history';

@Injectable()
export class StatusWebHistoriesService {
	constructor(
		@InjectModel(StatusWebHistory.name)
		private readonly statusWebHistoryModel: PaginateModel<StatusWebHistory>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
	) {}

	async addRegister({ orderId, status, user }: CreateStatusWebHistoryInput) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new BadRequestException('El pedido no existe');
		}

		return this.statusWebHistoryModel.create({
			order: order._id,
			status,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});
	}
}

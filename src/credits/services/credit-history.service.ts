import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregatePaginateModel } from 'mongoose';
import { Order } from 'src/sales/entities/order.entity';

import { CreditHistory } from '../entities/credit-history.entity';
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

	async addCreditHistory(orderId: string, amount: number) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}
		//validar monto
		//actualizar la cartera
		//crear el registro
	}

	async deleteCreditHistory(orderId: string, amount: number) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}
		//validar monto para debitar
		//actualiar la cartera
		//crear el registro
	}

	async frozenCreditHistory(orderId: string, amount: number) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}
		//validar monto a congelar
		//actualiar la cartera
		//crear el registro
	}

	async thawedCreditHistory(orderId: string, amount: number) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new NotFoundException('Pedido no encontrado');
		}
		//validar monto a descongelar
		//actualiar la cartera
		//crear el registro
	}
}

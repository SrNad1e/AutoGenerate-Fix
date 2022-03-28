import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { CustomersService } from 'src/crm/services/customers.service';

import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput } from '../dtos/create-order-input';
import { Order } from '../entities/order.entity';

const statuTypes = [
	'open',
	'pending',
	'cancelled',
	'closed',
	'sent',
	'invoiced',
];

@Injectable()
export class OrdersService {
	constructor(
		@InjectModel(Order.name) private readonly orderModel: PaginateModel<Order>,
		private readonly customersService: CustomersService,
	) {}

	async create({ status }: CreateOrderInput, user: User) {
		try {
			if (!['open', 'pending'].includes(status)) {
				throw new BadRequestException('El estado del pedido no es correcto');
			}

			if (user.type === 'employee') {
				const customerDefault =
					await this.customersService.getCustomerDefault();
					
			}

			//se crea el pedido a la tienda mayorista
		} catch (error) {
			return error;
		}
	}
}

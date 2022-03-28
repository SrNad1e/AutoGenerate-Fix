import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { CustomersService } from 'src/crm/services/customers.service';
import { ShopsService } from 'src/shops/services/shops.service';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput } from '../dtos/create-order-input';
import { UpdateOrderInput } from '../dtos/update-order-input';
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
		private readonly shopsService: ShopsService,
	) {}

	async create({ status }: CreateOrderInput, user: User) {
		try {
			if (!['open', 'pending'].includes(status)) {
				throw new BadRequestException('El estado del pedido no es correcto');
			}

			if (user.type === 'employee' && status === 'open') {
				const customer = await this.customersService.getCustomerDefault();
				const shop = await this.shopsService.findById(user.shop._id.toString());

				return this.orderModel.create({ customer, shop, user });
			}

			const customer = await this.customersService.getCustomerAssigning(
				user._id.toString(),
			);
			const shop = await this.shopsService.getShopWholesale();

			return this.orderModel.create({ customer, shop, user });
		} catch (error) {
			return error;
		}
	}

	async update({}: UpdateOrderInput, user: User) {}
}

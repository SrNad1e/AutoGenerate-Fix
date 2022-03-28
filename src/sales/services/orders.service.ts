import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { CustomersService } from 'src/crm/services/customers.service';
import { ShopsService } from 'src/shops/services/shops.service';
import { User } from 'src/users/entities/user.entity';
import { AddPaymentsOrderInput } from '../dtos/addPayments-order-input';
import { AddProductsOrderInput } from '../dtos/addProducts-order-input';
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

	async update(
		orderId: string,
		{ status, customerId }: UpdateOrderInput,
		user: User,
	) {
		try {
			const order = await this.orderModel.findById(orderId).lean();

			if (!order) {
				throw new BadRequestException(
					'El pedido que intenta actualizar no existe',
				);
			}
			const dataUpdate = {};

			if (customerId) {
				const customer = await this.customersService.findById(customerId);
				if (!customer?._id) {
					throw new NotFoundException('El cliente seleccionado no existe');
				}

				dataUpdate['customer'] = customer;
			}

			if (status) {
				if (!statuTypes.includes(status)) {
					throw new BadRequestException(
						`El estado ${status} no es un estado válido`,
					);
				}

				switch (order?.status) {
					case 'open':
						if (!['cancelled', 'invoiced'].includes(status)) {
							throw new BadRequestException('El pedido se encuentra abierto');
						}
						break;
					case 'pending':
						if (!['open'].includes(status)) {
							throw new BadRequestException('El pedido se encuentra pendiente');
						}
						break;
					case 'invoiced':
						if (!['sent', 'closed'].includes(status)) {
							throw new BadRequestException('El pedido se encuentra facturado');
						}
						break;
					case 'sent':
						if (!['closed'].includes(status)) {
							throw new BadRequestException('El pedido se encuentra enviado');
						}
						break;
					case 'calcelled' || 'closed':
						throw new BadRequestException('El pedido se encuentra finalizado');
					default:
						break;
				}

				if (status === 'invoiced') {
					//TODO: generar el proceso de facturación
				}
				dataUpdate['status'] = status;
			}

			return this.orderModel.findByIdAndUpdate(orderId, {
				$set: { ...dataUpdate, user },
			});
		} catch (error) {
			return error;
		}
	}

	async addProducts({ orderId, details }: AddProductsOrderInput) {
		try {
			const order = await this.orderModel.findById(orderId).lean();

			if (!order) {
				throw new BadRequestException(
					'El pedido que intenta actualizar no existe',
				);
			}

			if (order?.status !== 'open') {
				throw new BadRequestException(
					`El pedido ${order.number} no se encuentra abierto`,
				);
			}

			//validar productos a eliminar

			//validar productos a actualizar

			//validar productos a crear

			//guardar el pedido
		} catch (error) {
			return error;
		}
	}

	async addPayments({ orderId, payments }: AddPaymentsOrderInput) {
		try {
			const order = await this.orderModel.findById(orderId).lean();

			if (!order) {
				throw new BadRequestException(
					'El pedido que intenta actualizar no existe',
				);
			}
		} catch (error) {
			return error;
		}
	}
}

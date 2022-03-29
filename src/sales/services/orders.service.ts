import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { CustomersService } from 'src/crm/services/customers.service';
import { StockHistoryService } from 'src/inventories/services/stock-history.service';
import { ProductsService } from 'src/products/services/products.service';
import { ShopsService } from 'src/shops/services/shops.service';
import { PaymentsService } from 'src/treasury/services/payments.service';
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
		private readonly productsService: ProductsService,
		private readonly stockHistoryService: StockHistoryService,
		private readonly paymentsService: PaymentsService,
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

	async addProducts({ orderId, details }: AddProductsOrderInput, user: User) {
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

			let newDetails = [...order.details];

			const productsDelete = details?.filter(
				(item) => item.action === 'delete',
			);

			if (productsDelete) {
				for (let i = 0; i < productsDelete.length; i++) {
					const detail = productsDelete[i];

					const index = newDetails.findIndex(
						(item) => item.product._id.toString() === detail.productId,
					);

					if (index < 0) {
						throw new BadRequestException(
							`El producto ${detail.productId} no existe en el pedido ${order?.number}`,
						);
					}
				}

				const products = productsDelete.map((item) => item.productId);

				newDetails = newDetails.filter(
					(item) => !products.includes(item.product._id.toString()),
				);
			}

			const productsUpdate = details?.filter(
				(item) => item.action === 'update',
			);

			if (productsUpdate) {
				for (let i = 0; i < productsUpdate.length; i++) {
					const detail = productsUpdate[i];

					const index = newDetails.findIndex(
						(item) => item.product._id.toString() === detail.productId,
					);

					if (index < 0) {
						throw new BadRequestException(
							`El producto ${detail.productId} no existe en el pedido ${order?.number}`,
						);
					}
				}

				for (let i = 0; i < productsUpdate.length; i++) {
					const detail = productsUpdate[i];

					const product = await this.productsService.findOne({
						warehouseId: order?.shop?.defaultWarehouse.toString(),
						_id: detail.productId,
					});

					if (product) {
						if (product?.stock[0]?.quantity < detail?.quantity) {
							throw new BadRequestException(
								`El producto ${product?.reference} / ${product?.barcode} no tiene unidades disponibles, Disponible: ${product?.stock[0]?.quantity}`,
							);
						}
					} else {
						throw new NotFoundException(
							'Uno de los productos enviados para actualizar no existe',
						);
					}
				}

				newDetails = newDetails.map((detail) => {
					const productFind = productsUpdate.find(
						(item) => item.productId === detail?.product?._id.toString(),
					);

					if (productFind) {
						return {
							...detail,
							quantity: productFind.quantity,
							updateAt: new Date(),
						};
					}

					return detail;
				});
			}

			const productsCreate = details?.filter(
				(item) => item.action === 'create',
			);

			if (productsCreate) {
				for (let i = 0; i < productsCreate.length; i++) {
					const detail = productsCreate[i];

					const index = newDetails.findIndex(
						(item) => item.product._id.toString() === detail.productId,
					);

					if (index >= 0) {
						throw new BadRequestException(
							`El producto ${newDetails[index].product.reference}/${newDetails[index].product.barcode} ya existe en la orden ${order?.number} y no se puede agregar`,
						);
					}
				}

				for (let i = 0; i < productsUpdate.length; i++) {
					const detail = productsUpdate[i];

					const product = await this.productsService.findOne({
						warehouseId: order?.shop?.defaultWarehouse.toString(),
						_id: detail.productId,
					});
					if (product) {
						if (product?.stock[0]?.quantity < detail?.quantity) {
							throw new BadRequestException(
								`El producto ${product?.reference} / ${product?.barcode} no tiene unidades disponibles, Disponible: ${product?.stock[0]?.quantity}`,
							);
						}

						newDetails.push({
							product,
							status: 'new',
							quantity: detail.quantity,
							createdAt: new Date(),
							updateAt: new Date(),
						});
					} else {
						throw new NotFoundException(
							'Uno de los productos enviados para crear no existe',
						);
					}
				}
			}

			//construir actualización
			for (let i = 0; i < productsUpdate.length; i++) {
				const product = productsUpdate[i];

				const quantityOld = order.details.find(
					(item) => item.product._id.toString() === product.productId,
				)?.quantity;

				if (product.quantity < quantityOld) {
					productsDelete.push(product);
				}

				if (product.quantity > quantityOld) {
					productsCreate.push(product);
				}
			}

			//generar movimientos de inventario
			await this.stockHistoryService.addStock({
				details: productsDelete,
				documentId: orderId,
				documentType: 'order',
				warehouseId: order.shop.defaultWarehouse.toString(),
			});

			await this.stockHistoryService.deleteStock({
				details: productsCreate,
				documentId: orderId,
				documentType: 'order',
				warehouseId: order.shop.defaultWarehouse.toString(),
			});

			return this.orderModel.findByIdAndUpdate(orderId, {
				$set: {
					details: newDetails,
					user,
				},
			});
		} catch (error) {
			return error;
		}
	}

	async addPayments({ orderId, payments }: AddPaymentsOrderInput, user: User) {
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

			let newPayments = [...order.payments];

			const paymentsDelete = payments?.filter(
				(item) => item.action === 'delete',
			);

			if (paymentsDelete) {
				for (let i = 0; i < paymentsDelete.length; i++) {
					const payment = paymentsDelete[i];

					const index = newPayments.findIndex(
						(item) => item.payment._id.toString() === payment.paymentId,
					);

					if (index < 0) {
						throw new BadRequestException(
							`El método de pago ${payment.paymentId} no existe en el pedido ${order?.number}`,
						);
					}
				}

				const payments = paymentsDelete.map((item) => item.paymentId);

				newPayments = newPayments.filter(
					(item) => !payments.includes(item.payment._id.toString()),
				);
			}

			const paymentsUpdate = payments?.filter(
				(item) => item.action === 'update',
			);

			if (paymentsUpdate) {
				for (let i = 0; i < paymentsUpdate.length; i++) {
					const detail = paymentsUpdate[i];

					const index = newPayments.findIndex(
						(item) => item.payment._id.toString() === detail.paymentId,
					);

					if (index < 0) {
						throw new BadRequestException(
							`El producto ${detail.paymentId} no existe en el pedido ${order?.number}`,
						);
					}
				}
				newPayments = newPayments.map((item) => {
					const paymentFind = paymentsUpdate.find(
						(payment) => payment.paymentId === item.payment._id.toString(),
					);
					if (paymentFind) {
						return {
							...item,
							total: paymentFind.total,
							updateAt: new Date(),
						};
					}
					return item;
				});
			}

			const paymentsCreate = payments?.filter(
				(item) => item.action === 'create',
			);

			if (paymentsCreate) {
				for (let i = 0; i < paymentsCreate.length; i++) {
					const detail = paymentsCreate[i];

					const index = newPayments.findIndex(
						(item) => item.payment._id.toString() === detail.paymentId,
					);

					if (index >= 0) {
						throw new BadRequestException(
							`El producto ${newPayments[index].payment.name} ya existe en la orden ${order?.number} y no se puede agregar`,
						);
					}
				}

				for (let i = 0; i < paymentsCreate.length; i++) {
					const detailPayment = paymentsCreate[i];
					const payment = await this.paymentsService.findById(
						detailPayment.paymentId,
					);
					newPayments.push({
						payment,
						total: detailPayment.total,
						createdAt: new Date(),
						updateAt: new Date(),
					});
				}
			}

			return this.orderModel.findByIdAndUpdate(orderId, {
				$set: {
					payments: newPayments,
					user,
				},
			});
		} catch (error) {
			return error;
		}
	}
}

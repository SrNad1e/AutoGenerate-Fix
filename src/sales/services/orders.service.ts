import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types } from 'mongoose';
import { CustomerTypeService } from 'src/crm/services/customer-type.service';

import { CustomersService } from 'src/crm/services/customers.service';
import { StockHistoryService } from 'src/inventories/services/stock-history.service';
import { ProductsService } from 'src/products/services/products.service';
import { ShopsService } from 'src/shops/services/shops.service';
import { PaymentsService } from 'src/treasury/services/payments.service';
import { User } from 'src/users/entities/user.entity';
import { AddPaymentsOrderInput } from '../dtos/add-payments-order-input';
import { AddProductsOrderInput } from '../dtos/add-products-order-input';
import { CreateOrderInput } from '../dtos/create-order-input';
import { UpdateOrderInput } from '../dtos/update-order-input';
import { Order } from '../entities/order.entity';
import { InvoicesService } from './invoices.service';

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
		private readonly invoicesService: InvoicesService,
		private readonly customerTypesService: CustomerTypeService,
	) {}

	async findById(id: string) {
		return this.orderModel.findById(id).lean();
	}

	async create({ status }: CreateOrderInput, user: User, companyId: string) {
		if (!['open', 'pending'].includes(status)) {
			throw new BadRequestException('El estado del pedido no es correcto');
		}

		if (user?.pointOfSale && status === 'open') {
			const customer = await this.customersService.getCustomerDefault();
			const shop = await this.shopsService.findById(
				user.pointOfSale['shop'].toString(),
			);
			return this.orderModel.create({
				customer,
				shop,
				user,
				pointOfSale: user.pointOfSale._id,
			});
		}

		const shop = await this.shopsService.getShopWholesale();

		if (!user.customer) {
			throw new BadRequestException('El usuario no pertenece a un cliente');
		}

		let number = 1;
		const lastOrder = await this.orderModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			})
			.lean();

		if (lastOrder) {
			number = lastOrder.number + 1;
		}

		console.log(user?.customer);

		const address =
			user?.customer['addresses'].length > 0
				? user?.customer['addresses'].find((address) => address?.isMain)
				: undefined;

		return this.orderModel.create({
			customer: user.customer,
			address,
			shop,
			user,
			number,
			status,
			company: new Types.ObjectId(companyId),
		});
	}

	async update(
		orderId: string,
		{ status, customerId, address }: UpdateOrderInput,
		user: User,
	) {
		const order = await this.orderModel.findById(orderId).lean();

		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}
		const dataUpdate = { address };

		if (customerId) {
			const customer = await this.customersService.findById(customerId);
			if (!customer?._id) {
				throw new NotFoundException('El cliente seleccionado no existe');
			}

			dataUpdate['customer'] = customer;

			if (
				customer.customerType._id.toString() !==
				order.customer.customerType._id.toString()
			) {
				const newDetails = order.details.map((detail) => ({
					...detail,
					discount:
						(customer?.customerType['discount'] / 100) *
						detail?.product?.reference['price'],
					updatedAt: new Date(),
				}));

				const subtotal = newDetails.reduce(
					(sum, detail) => sum + detail.price * detail.quantity,
					0,
				);

				const discount = newDetails.reduce(
					(sum, detail) => sum + detail.quantity * detail.discount,
					0,
				);

				const total = subtotal - discount;

				const tax = 0;

				const summary = {
					...order.summary,
					total,
					discount,
					subtotal,
					tax,
				};
				dataUpdate['summary'] = summary;
				dataUpdate['details'] = newDetails;
			}
		}
		let invoice;

		if (status) {
			if (!statuTypes.includes(status)) {
				throw new BadRequestException(
					`El estado ${status} no es un estado válido`,
				);
			}

			switch (order?.status) {
				case 'open':
					if (!['cancelled', 'invoiced', 'closed'].includes(status)) {
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

			if (
				(order.status === 'open' && status === 'closed') ||
				status === 'invoiced'
			) {
				const result = await this.invoicesService.create(
					{
						customerId,
						details: order.details.map((item) => ({
							productId: item.product._id.toString(),
							quantity: item.quantity,
							price: item.price,
							discount: item.discount,
						})),
						payments: order.payments.map((item) => ({
							paymentId: item.payment._id.toString(),
							total: item.total,
						})),
					},
					user,
				);
				invoice = result._id;
			}

			dataUpdate['status'] = status;
		}

		return this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: { ...dataUpdate, user, invoice },
			},
			{
				new: true,
				lean: true,
			},
		);
	}

	/**
	 * @description obtiene los pedidos del punto de venta
	 * @param idPointOfSale punto de venta
	 * @returns pedidos del punto de venta
	 */
	async getByPointOfSales(idPointOfSale: string) {
		return this.orderModel.find({ pointOfSale: idPointOfSale }).lean();
	}

	async addProducts(
		{ orderId, details }: AddProductsOrderInput,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId).lean();

		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}

		if (!['open', 'pending'].includes(order?.status)) {
			throw new BadRequestException(
				`El pedido ${order.number} no se encuentra abierto`,
			);
		}

		let newDetails = [...order.details];

		const productsDelete = details?.filter((item) => item.action === 'delete');

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

		const productsUpdate = details?.filter((item) => item.action === 'update');

		const customerType = await this.customerTypesService.findById(
			order.customer.customerType._id.toString(),
		);

		if (productsUpdate) {
			for (let i = 0; i < productsUpdate.length; i++) {
				const { quantity, productId } = productsUpdate[i];

				const index = newDetails.findIndex(
					(item) => item.product._id.toString() === productId,
				);

				if (index < 0) {
					throw new BadRequestException(
						`El producto ${productId} no existe en el pedido ${order?.number}`,
					);
				}

				const product = await this.productsService.validateStock(
					productId,
					quantity > newDetails[index].quantity
						? quantity - newDetails[index].quantity
						: quantity,
					order?.shop?.defaultWarehouse.toString(),
				);

				newDetails[index] = {
					...newDetails[index],
					product,
					quantity,
					discount: (customerType.discount / 100) * product?.reference['price'],
					updatedAt: new Date(),
				};
			}
		}

		const productsCreate = details?.filter((item) => item.action === 'create');

		if (productsCreate) {
			for (let i = 0; i < productsCreate.length; i++) {
				const { quantity, productId } = productsCreate[i];

				const index = newDetails.findIndex(
					(item) => item.product._id.toString() === productId,
				);

				if (index >= 0) {
					throw new BadRequestException(
						`El producto ${newDetails[index].product.reference['name']}/${newDetails[index].product.barcode} ya existe en la orden ${order?.number} y no se puede agregar`,
					);
				}

				const product = await this.productsService.validateStock(
					productId,
					quantity,
					order?.shop?.defaultWarehouse.toString(),
				);

				newDetails.push({
					product,
					status: 'new',
					quantity,
					price: product.reference['price'],
					discount: (customerType.discount / 100) * product.reference['price'],
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		}

		for (let i = 0; i < productsUpdate.length; i++) {
			const product = productsUpdate[i];

			const quantityOld = order.details.find(
				(item) => item.product._id.toString() === product.productId,
			)?.quantity;

			productsDelete.push({ ...product, quantity: quantityOld });

			productsCreate.push(product);
		}

		await this.stockHistoryService.addStock(
			{
				details: productsDelete,
				documentId: orderId,
				documentType: 'order',
				warehouseId: order.shop.defaultWarehouse['_id'].toString(),
			},
			user,
			companyId,
		);

		await this.stockHistoryService.deleteStock(
			{
				details: productsCreate,
				documentId: orderId,
				documentType: 'order',
				warehouseId: order.shop.defaultWarehouse['_id'].toString(),
			},
			user,
			companyId,
		);

		const subtotal = newDetails.reduce(
			(sum, detail) => sum + detail.price * detail.quantity,
			0,
		);

		const discount = newDetails.reduce(
			(sum, detail) => sum + detail.quantity * detail.discount,
			0,
		);

		const total = subtotal - discount;

		const tax = 0;

		const summary = {
			...order.summary,
			total,
			discount,
			subtotal,
			tax,
		};

		return this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					details: newDetails,
					user,
					summary,
				},
			},
			{
				new: true,
				lean: true,
			},
		);
	}

	async addPayments({ orderId, payments }: AddPaymentsOrderInput, user: User) {
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

		const paymentsDelete = payments?.filter((item) => item.action === 'delete');

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

		const paymentsUpdate = payments?.filter((item) => item.action === 'update');

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
						updatedAt: new Date(),
					};
				}
				return item;
			});
		}

		const paymentsCreate = payments?.filter((item) => item.action === 'create');

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
					updatedAt: new Date(),
				});
			}
		}

		const totalPaid = newPayments.reduce(
			(sum, payment) => sum + payment.total,
			0,
		);

		const change = totalPaid - order.summary.total;

		const summary = {
			...order.summary,
			totalPaid,
			change,
		};

		return this.orderModel.findByIdAndUpdate(orderId, {
			$set: {
				payments: newPayments,
				user,
				summary,
			},
		});
	}
}

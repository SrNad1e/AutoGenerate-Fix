import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { ConveyorsService } from 'src/configurations/services/conveyors.service';
import { CustomersService } from 'src/crm/services/customers.service';
import { StockHistoryService } from 'src/inventories/services/stock-history.service';
import { ProductsService } from 'src/products/services/products.service';
import { PaymentsService } from 'src/treasury/services/payments.service';
import { ReceiptsService } from 'src/treasury/services/receipts.service';
import {
	ActionPaymentsOrder,
	AddPaymentsOrderInput,
} from '../dtos/add-payments-order-input';
import { AddProductsOrderInput } from '../dtos/add-products-order-input';
import { CreateOrderInput } from '../dtos/create-order-input';
import { UpdateOrderInput } from '../dtos/update-order-input';
import { Invoice } from '../entities/invoice.entity';
import {
	Order,
	StatusOrder,
	StatusOrderDetail,
} from '../entities/order.entity';
import { PointOfSalesService } from './point-of-sales.service';
import { User } from 'src/configurations/entities/user.entity';
import { ShopsService } from 'src/configurations/services/shops.service';
import { FiltersOrdersInput } from '../dtos/filters-orders.input';
import { DiscountRulersService } from 'src/crm/services/discount-rulers.service';
import { DocumentTypeStockHistory } from 'src/inventories/dtos/create-stockHistory-input';
import { StatusProduct } from 'src/products/entities/product.entity';
import { ActionProductsOrder } from '../dtos/add-products-order-input';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { CouponsService } from 'src/crm/services/coupons.service';
import { StatusCoupon } from 'src/crm/entities/coupon.entity';

const populate = [
	{
		path: 'invoice',
		model: Invoice.name,
	},
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
		private readonly receiptsService: ReceiptsService,
		private readonly discountRulesService: DiscountRulersService,
		private readonly conveyorsService: ConveyorsService,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly couponsService: CouponsService,
	) {}

	async findAll(
		{
			status,
			dateFinal,
			dateInitial,
			document,
			number,
			orderPOS,
			sort,
			limit = 10,
			page = 1,
		}: FiltersOrdersInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Order> = {};
		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (StatusOrder[status]) {
			filters.status = StatusOrder[status];
		}

		if (orderPOS !== undefined) {
			filters.orderPOS = orderPOS;
		}

		if (dateInitial) {
			if (!dateFinal) {
				throw new BadRequestException('Debe enviarse una fecha final');
			}

			filters['createdAt'] = {
				$gte: new Date(dateInitial),
				$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
			};
		} else if (dateFinal) {
			if (!dateInitial) {
				throw new BadRequestException('Debe enviarse una fecha inicial');
			}
			filters['createdAt'] = {
				$gte: new Date(dateInitial),
				$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
			};
		}

		if (number) {
			filters.number = number;
		}

		if (document) {
			filters['customer.document'] = document;
		}

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.orderModel.paginate(filters, options);
	}

	async findById(id: string) {
		const order = await this.orderModel.findById(id).populate(populate).lean();
		const credit = await this.creditsService.findOne({
			customerId: order?.customer?._id.toString(),
		});
		return {
			order,
			credit,
		};
	}

	async create({ status }: CreateOrderInput, user: User, companyId: string) {
		if (
			![StatusOrder.OPEN, StatusOrder.PENDING].includes(StatusOrder[status])
		) {
			throw new BadRequestException('El estado del pedido no es correcto');
		}

		if (user?.pointOfSale && StatusOrder[status] === StatusOrder.OPEN) {
			if (dayjs().isBefore(dayjs(user?.pointOfSale['closeDate']).add(1, 'd'))) {
				throw new NotFoundException(
					`El punto de venta se encuentra cerrado para el día ${dayjs(
						user?.pointOfSale['closeDate'],
					).format('DD/MM/YYYY')}`,
				);
			}
			const customer = await this.customersService.getCustomerDefault();
			const shop = await this.shopsService.findById(
				user.pointOfSale['shop'].toString(),
			);

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
			return this.orderModel.create({
				customer,
				shop,
				number,
				company: new Types.ObjectId(companyId),
				user,
				pointOfSale: user.pointOfSale._id,
			});
		} else {
			if (!user.customer) {
				throw new BadRequestException('El usuario no pertenece a un cliente');
			}
		}

		const shop = await this.shopsService.getShopWholesale();

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

		const address =
			user?.customer['addresses']?.length > 0
				? user?.customer['addresses']?.find((address) => address?.isMain)
				: undefined;

		return this.orderModel.create({
			customer: user.customer,
			address,
			shop,
			orderPos: false,
			user,
			number,
			status: StatusOrder[status],
			company: new Types.ObjectId(companyId),
		});
	}

	async update(
		orderId: string,
		{ status, customerId, address, conveyorId }: UpdateOrderInput,
		user: User,
		companyId: string,
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
				const newDetails = [];

				for (let i = 0; i < order?.details?.length; i++) {
					const detail = order?.details[i];

					const discount = await this.discountRulesService.getDiscountReference(
						{
							customerId: customer._id.toString(),
							reference: detail?.product?.reference as any,
						},
					);

					newDetails.push({
						...detail,
						price: detail?.product?.reference['price'] - discount,
						discount,
						updatedAt: new Date(),
					});
				}

				const total = newDetails.reduce(
					(sum, detail) => sum + detail.price * detail.quantity,
					0,
				);

				const discount = newDetails.reduce(
					(sum, detail) => sum + detail.quantity * detail.discount,
					0,
				);

				const subtotal = total + discount;

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

		let credit;
		if (order?.customer || customerId) {
			await this.creditsService.findOne({
				customerId: customerId || order?.customer?._id?.toString(),
			});
		}

		if (StatusOrder[status]) {
			switch (order?.status) {
				case StatusOrder.OPEN:
					if (
						![
							StatusOrder.CANCELLED,
							StatusOrder.INVOICED,
							StatusOrder.CLOSED,
						].includes(StatusOrder[status])
					) {
						throw new BadRequestException('El pedido se encuentra abierto');
					}
					break;
				case StatusOrder.PENDING:
					if (
						![StatusOrder.OPEN || StatusOrder.CANCELLED].includes(
							StatusOrder[status],
						)
					) {
						throw new BadRequestException('El pedido se encuentra pendiente');
					}
					break;
				case StatusOrder.INVOICED:
					if (
						![StatusOrder.SENT, StatusOrder.CLOSED].includes(
							StatusOrder[status],
						)
					) {
						throw new BadRequestException('El pedido se encuentra facturado');
					}
					break;
				case StatusOrder.SENT:
					if (![StatusOrder.CLOSED].includes(StatusOrder[status])) {
						throw new BadRequestException('El pedido se encuentra enviado');
					}
					break;
				case StatusOrder.CANCELLED || StatusOrder.CLOSED:
					throw new BadRequestException('El pedido se encuentra finalizado');
				default:
					break;
			}

			const payments = [];

			if (
				order.status === StatusOrder.OPEN &&
				StatusOrder[status] === StatusOrder.CLOSED
			) {
				for (let i = 0; i < order?.payments?.length; i++) {
					const { total, payment } = order?.payments[i];
					if (payment?.type !== TypePayment.CREDIT) {
						const valuesReceipt = {
							value: total,
							paymentId: payment?._id?.toString(),
							concept: `Abono a pedido ${order?.number}`,
							boxId:
								payment?.type === 'cash'
									? order?.pointOfSale['box']?.toString()
									: undefined,
						};

						const receipt = await this.receiptsService.create(
							valuesReceipt,
							user,
							companyId,
						);

						payments.push({
							...order?.payments[i],
							receipt: receipt?._id,
						});
					} else {
						payments.push(order?.payments[i]);

						//TODO: agregar todo lo correspondiente al crédito
					}
				}
			}
			if (payments.length > 0) {
				dataUpdate['payments'] = payments;
			}

			dataUpdate['status'] = StatusOrder[status];
		}

		let conveyor;
		if (conveyorId) {
			conveyor = await this.conveyorsService.findById(conveyorId);
			if (!conveyor) {
				throw new NotFoundException('El transportista no existe');
			}
		}

		if (StatusOrder[status] === StatusOrder.CANCELLED) {
			if (order?.status === StatusOrder.OPEN) {
				const details = order?.details?.map((detail) => ({
					productId: detail?.product?._id.toString(),
					quantity: detail?.quantity,
				}));
				if (details.length > 0) {
					await this.stockHistoryService.addStock(
						{
							details,
							warehouseId: order?.shop?.defaultWarehouse?._id.toString(),
							documentId: order?._id.toString(),
							documentType: DocumentTypeStockHistory.ORDER,
						},
						user,
						companyId,
					);
				}
			}
		}

		if (StatusOrder[status] === StatusOrder.OPEN) {
			const details = order.details.map((detail) => ({
				productId: detail?.product?._id.toString(),
				quantity: detail?.quantity,
			}));

			await this.stockHistoryService.deleteStock(
				{
					details,
					documentId: orderId,
					documentType: DocumentTypeStockHistory.ORDER,
					warehouseId: order.shop.defaultWarehouse['_id'].toString(),
				},
				user,
				companyId,
			);
		}

		if (StatusOrder[status] === StatusOrder.CLOSED) {
			for (let i = 0; i < order?.payments?.length; i++) {
				const payment = order?.payments[i];

				if (payment?.payment?.type === TypePayment.BONUS) {
					if (!payment?.code) {
						throw new BadRequestException(
							'El medio de pago cupón debe tener código',
						);
					}

					const coupon = await this.couponsService.findOne(
						{
							code: payment?.code,
						},
						user,
						companyId,
					);

					await this.couponsService.update(
						coupon?._id?.toString(),
						{
							status: StatusCoupon.REDEEMED,
						},
						user,
						order.company.toString(),
					);
				}
			}
		}

		return this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: { ...dataUpdate, user, conveyor },
			},
			{
				populate,
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
		const pointOfSale = await this.pointOfSalesService.findById(idPointOfSale);

		if (!pointOfSale) {
			throw new NotFoundException('El punto de venta no existe');
		}

		if (dayjs().isBefore(dayjs(pointOfSale?.closeDate).add(1, 'd'))) {
			throw new NotFoundException(
				`El punto de venta se encuentra cerrado para el día ${dayjs(
					pointOfSale?.closeDate,
				).format('DD/MM/YYYY')}`,
			);
		}

		return this.orderModel
			.find({
				pointOfSale: new Types.ObjectId(idPointOfSale),
				status: StatusOrder.OPEN,
			})
			.populate(populate)
			.lean();
	}

	async getSummaryOrder(closeDate: string, pointOfSaleId: string) {
		const dateIntial = new Date(closeDate);
		const dateFinal = dayjs(closeDate).add(1, 'd').toDate();

		const ordersCancel: any = await this.orderModel.aggregate([
			{
				$match: {
					updatedAt: {
						$gte: dateIntial,
						$lt: dateFinal,
					},
					status: StatusOrder.CANCELLED,
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: '$_id',
					total: {
						$sum: 1,
					},
				},
			},
		]);

		const aggregate = [
			{
				$match: {
					updatedAt: {
						$gte: dateIntial,
						$lt: dateFinal,
					},
					status: StatusOrder.OPEN,
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: '$_id',
					total: {
						$sum: 1,
					},
				},
			},
		];

		const ordersOpen: any = await this.orderModel.aggregate(aggregate);

		const ordersClosed: any = await this.orderModel.aggregate([
			{
				$match: {
					updatedAt: {
						$gte: dateIntial,
						$lt: dateFinal,
					},
					status: {
						$in: [StatusOrder.CLOSED, StatusOrder.SENT, StatusOrder.INVOICED],
					},
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: '$pointOfSale',
					total: {
						$sum: 1,
					},
					value: {
						$sum: '$summary.total',
					},
				},
			},
		]);

		const payments: any = await this.orderModel.aggregate([
			{
				$unwind: '$payments',
			},
			{
				$match: {
					updatedAt: {
						$gte: dateIntial,
						$lt: dateFinal,
					},
					status: {
						$in: [StatusOrder.CLOSED, StatusOrder.SENT, StatusOrder.INVOICED],
					},
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: '$payments.payment._id',
					total: {
						$sum: 1,
					},
					value: {
						$sum: '$payments.total',
					},
				},
			},
		]);

		return {
			summaryOrder: {
				quantityClosed: ordersClosed[0]?.total || 0,
				quantityOpen: ordersOpen[0]?.total || 0,
				quantityCancel: ordersCancel[0]?.total || 0,
				value: ordersClosed[0]?.value || 0,
			},
			payments:
				payments?.map((payment) => ({
					quantity: payment?.total,
					value: payment?.value,
					payment: payment?._id,
				})) || [],
		};
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

		if (![StatusOrder.OPEN, StatusOrder.PENDING].includes(order?.status)) {
			throw new BadRequestException(
				`El pedido ${order.number} no se encuentra abierto`,
			);
		}

		let newDetails = [...order.details];

		const productsDelete = details?.filter(
			(item) => ActionProductsOrder[item.action] === ActionProductsOrder.DELETE,
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
			(item) => ActionProductsOrder[item.action] === ActionProductsOrder.UPDATE,
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
					order?.shop?.defaultWarehouse._id.toString(),
				);

				if (!product) {
					throw new BadRequestException('Uno de los productos no existe');
				}

				if (product?.status !== StatusProduct.ACTIVE) {
					throw new BadRequestException(
						`El producto ${product?.barcode} no se encuentra activo`,
					);
				}

				newDetails[index] = {
					...newDetails[index],
					product,
					quantity,
					updatedAt: new Date(),
				};
			}
		}

		const productsCreate = details?.filter(
			(item) => ActionProductsOrder[item.action] === ActionProductsOrder.CREATE,
		);

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
					order?.shop?.defaultWarehouse?._id?.toString(),
				);

				if (!product) {
					throw new BadRequestException('Uno de los productos no existe');
				}

				if (product?.status !== StatusProduct.ACTIVE) {
					throw new BadRequestException(
						`El producto ${product?.barcode} no se encuentra activo`,
					);
				}

				const discount = await this.discountRulesService.getDiscountReference({
					customerId: order?.customer?._id.toString(),
					reference: product?.reference as any,
				});

				newDetails.push({
					product,
					status: StatusOrderDetail.NEW,
					quantity,
					price: product.reference['price'] - discount,
					discount,
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

		if (order?.status === StatusOrder.OPEN) {
			if (productsDelete.length > 0) {
				await this.stockHistoryService.addStock(
					{
						details: productsDelete,
						documentId: orderId,
						documentType: DocumentTypeStockHistory.ORDER,
						warehouseId: order.shop.defaultWarehouse['_id'].toString(),
					},
					user,
					companyId,
				);
			}

			if (productsCreate.length > 0) {
				await this.stockHistoryService.deleteStock(
					{
						details: productsCreate,
						documentId: orderId,
						documentType: DocumentTypeStockHistory.ORDER,
						warehouseId: order.shop.defaultWarehouse['_id'].toString(),
					},
					user,
					companyId,
				);
			}
		}

		const total = newDetails.reduce(
			(sum, detail) => sum + detail.price * detail.quantity,
			0,
		);

		const discount = newDetails.reduce(
			(sum, detail) => sum + detail.quantity * detail.discount,
			0,
		);

		const subtotal = total + discount;

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
				populate,
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

		if (![StatusOrder.OPEN, StatusOrder.PENDING].includes(order?.status)) {
			throw new BadRequestException(
				`El pedido ${order.number} ya se encuentra procesado`,
			);
		}

		for (let i = 0; i < payments.length; i++) {
			const payment = payments[i];

			if (payment?.total <= 0) {
				throw new BadRequestException(
					`Los medios de pago no pueden ser menores o iguales a 0`,
				);
			}
		}

		let newPayments = [...order.payments];

		const paymentsDelete = payments?.filter(
			(item) => ActionPaymentsOrder[item.action] === ActionPaymentsOrder.DELETE,
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
				if (newPayments[index]?.payment?.type === TypePayment.BONUS) {
					if (!payment?.code) {
						throw new BadRequestException(
							'El medio de pago cupón debe tener código',
						);
					}
					const coupon = await this.couponsService.findOne(
						{
							code: newPayments[index]?.code,
						},
						user,
						order.company.toString(),
					);
					await this.couponsService.update(
						coupon?._id?.toString(),
						{
							status: StatusCoupon.ACTIVE,
						},
						user,
						order.company.toString(),
					);
				}
			}

			const payments = paymentsDelete.map((item) => item.paymentId);

			newPayments = newPayments.filter(
				(item) => !payments.includes(item.payment._id.toString()),
			);
		}

		const paymentsUpdate = payments?.filter(
			(item) => ActionPaymentsOrder[item.action] === ActionPaymentsOrder.UPDATE,
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
						updatedAt: new Date(),
					};
				}
				return item;
			});
		}

		const paymentsCreate = payments?.filter(
			(item) => ActionPaymentsOrder[item.action] === ActionPaymentsOrder.CREATE,
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
					code: detailPayment.code,
					total: detailPayment.total,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				if (payment?.type === TypePayment.BONUS) {
					if (!detailPayment?.code) {
						throw new BadRequestException(
							'El medio de pago cupón debe tener código',
						);
					}
					const coupon = await this.couponsService.findOne(
						{
							code: detailPayment.code,
							status: StatusCoupon.ACTIVE,
						},
						user,
						order?.company?._id?.toString(),
					);

					if (!coupon) {
						throw new BadRequestException(
							'El cupón no existe o no puede usarse en esta factura',
						);
					}

					if (dayjs().isAfter(coupon?.expiration)) {
						throw new BadRequestException('El cupón ya se encuentra vencido');
					}
					await this.couponsService.update(
						coupon?._id?.toString(),
						{
							status: StatusCoupon.INACTIVE,
						},
						user,
						order.company.toString(),
					);
				}
			}
		}

		const totalPaid = newPayments.reduce(
			(sum, payment) => sum + payment.total,
			0,
		);

		const change = totalPaid - order.summary.total;

		const cash = newPayments.reduce((sum, payment) => sum + payment?.total, 0);

		if (!(cash > 0 && cash > change)) {
			throw new BadRequestException(
				`El valor diferente a efectivo supera el valor del pedido`,
			);
		}

		if (cash) {
			newPayments = newPayments.map((payment) => {
				if (payment?.payment?.type === 'cash') {
					return {
						...payment,
						total: payment?.total - change,
					};
				}

				return payment;
			});
		}

		const summary = {
			...order.summary,
			totalPaid,
			change,
		};

		return this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					payments: newPayments,
					user,
					summary,
				},
			},
			{
				populate,
				lean: true,
				new: true,
			},
		);
	}
}

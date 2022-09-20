import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
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
	DetailOrder,
	Order,
	StatusOrder,
	StatusOrderDetail,
} from '../entities/order.entity';
import { User } from 'src/configurations/entities/user.entity';
import { ShopsService } from 'src/configurations/services/shops.service';
import { FiltersOrdersInput } from '../dtos/filters-orders.input';
import { DiscountRulesService } from 'src/crm/services/discount-rules.service';
import { DocumentTypeStockHistory } from 'src/inventories/dtos/create-stockHistory-input';
import { StatusProduct } from 'src/products/entities/product.entity';
import { ActionProductsOrder } from '../dtos/add-products-order-input';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { CouponsService } from 'src/crm/services/coupons.service';
import { StatusCoupon } from 'src/crm/entities/coupon.entity';
import { CreditsService } from 'src/credits/services/credits.service';
import { CreditHistoryService } from 'src/credits/services/credit-history.service';
import { PointOfSale } from '../entities/pointOfSale.entity';
import { CustomerTypeService } from 'src/crm/services/customer-type.service';
import { ConfirmProductsOrderInput } from '../dtos/confirm-products-order.input';
import { ConfirmPaymentsOrderInput } from '../dtos/confirm-payments-order.input';
import { Conveyor } from 'src/configurations/entities/conveyor.entity';
import { StatusWeb } from '../entities/status-web-history';
import { StatusWebHistoriesService } from './status-web-histories.service';
import { StatusCredit } from 'src/credits/entities/credit.entity';

const populate = [
	{
		path: 'invoice',
		model: Invoice.name,
	},
	{
		path: 'pointOfSale',
		model: PointOfSale.name,
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
		private readonly discountRulesService: DiscountRulesService,
		private readonly conveyorsService: ConveyorsService,
		private readonly couponsService: CouponsService,
		private readonly creditHistoryService: CreditHistoryService,
		private readonly creditsService: CreditsService,
		private readonly customerTypesService: CustomerTypeService,
		private readonly statusWebHistoriesService: StatusWebHistoriesService,
	) {}

	async findAll(
		{
			status,
			dateFinal,
			dateInitial,
			customerId,
			number,
			orderPos,
			paymentId,
			sort,
			statusWeb,
			nonStatus,
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

		if (status) {
			filters.status = StatusOrder[status] || status;
		}

		if (statusWeb) {
			filters.statusWeb = StatusOrder[statusWeb] || statusWeb;
		}

		if (nonStatus?.length > 0) {
			filters.status = {
				$not: { $in: nonStatus.map((item) => StatusOrder[item]) },
			};
		}

		if (orderPos !== undefined) {
			filters.orderPos = orderPos;
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

		if (customerId) {
			filters['customer._id'] = new Types.ObjectId(customerId);
		}

		if (paymentId) {
			filters['payments.payment._id'] = new Types.ObjectId(paymentId);
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

		if (!order) {
			throw new BadRequestException('El pedido no existe');
		}

		let credit;
		try {
			credit = await this.creditsService.findOne({
				customerId: order?.customer?._id.toString(),
			});
		} catch {}

		return {
			order,
			credit,
		};
	}

	async create({ status }: CreateOrderInput, user: User, companyId: string) {
		if (
			![StatusOrder.OPEN, StatusOrder.PENDDING].includes(StatusOrder[status])
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

			const newOrder = await this.orderModel.create({
				customer,
				shop,
				number,
				company: new Types.ObjectId(companyId),
				user,
				pointOfSale: user.pointOfSale._id,
			});

			return {
				order: newOrder,
				credit: null,
			};
		} else {
			if (!user.customer) {
				throw new BadRequestException('El usuario no pertenece a un cliente');
			}
		}

		const oldOrder = await this.orderModel.findOne({
			'customer._id': user.customer._id,
			status: StatusOrder.PENDDING,
		});

		if (oldOrder) {
			let credit;

			try {
				credit = await this.creditsService.findOne({
					customerId: oldOrder?.customer?._id?.toString(),
				});
			} catch {}

			return {
				credit,
				order: oldOrder,
			};
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
			number = (lastOrder.number || 0) + 1;
		}

		const address =
			user?.customer['addresses']?.length > 0
				? user?.customer['addresses']?.find((address) => address?.isMain)
				: undefined;

		const newOrder = await this.orderModel.create({
			customer: user.customer,
			address,
			shop,
			orderPos: false,
			user,
			number,
			status: StatusOrder.PENDDING,
			statusWeb: StatusWeb.OPEN,
			company: new Types.ObjectId(companyId),
		});

		await this.statusWebHistoriesService.addRegister({
			orderId: newOrder._id.toString(),
			status: StatusWeb.OPEN,
			user,
		});
		let credit;

		try {
			credit = await this.creditsService.findOne({
				customerId: newOrder?.customer?._id?.toString(),
			});
		} catch {}

		return {
			credit,
			order: newOrder,
		};
	}

	async update(
		orderId: string,
		{ status, customerId, address, conveyorId, statusWeb }: UpdateOrderInput,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel
			.findById(orderId)
			.populate(populate)
			.lean();
		let credit;
		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}
		const dataUpdate = { address };
		let newDetails = [];
		let newSummary = undefined;

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
				for (let i = 0; i < order?.details?.length; i++) {
					const detail = order?.details[i];

					const discount = await this.discountRulesService.getDiscount({
						customerId: customer._id.toString(),
						reference: detail?.product?.reference as any,
						companyId,
					});

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

				newSummary = {
					...order.summary,
					total,
					discount,
					subtotal,
					tax,
				};
			}
		}

		let newStatus = status;

		if (StatusWeb[statusWeb]) {
			switch (StatusWeb[statusWeb]) {
				case StatusWeb.PENDDING:
					if (order.statusWeb !== StatusWeb.OPEN) {
						throw new BadRequestException(
							'El pedido no puede ser procesado, estado inválido',
						);
					}
					newStatus = StatusOrder.OPEN;
					break;
				case StatusWeb.PENDDING_CREDIT:
					if (order.statusWeb !== StatusWeb.OPEN) {
						throw new BadRequestException(
							'El pedido no puede ser procesado, estado inválido',
						);
					}
					newStatus = StatusOrder.OPEN;
					break;
				case StatusWeb.PAYMENT_CONFIRMED:
					if (
						![StatusWeb.PENDDING, StatusWeb.PENDDING_CREDIT].includes(
							order.statusWeb,
						)
					) {
						throw new BadRequestException(
							'El pedido no puede ser procesado, estado inválido',
						);
					}

					const confirmed = order.payments.find(
						({ payment, status }) =>
							payment.type !== TypePayment.CASH &&
							status === StatusOrderDetail.NEW,
					);

					if (confirmed) {
						throw new BadRequestException(
							'Debe confirmar los medios de pagos antes de cambiar de estado',
						);
					}
					break;
				case StatusWeb.SENT:
					if (
						![StatusWeb.PREPARING, StatusWeb.PAYMENT_CONFIRMED].includes(
							order.statusWeb,
						)
					) {
						throw new BadRequestException(
							'El pedido no puede ser procesado, estado inválido',
						);
					}
					newStatus = StatusOrder.CLOSED;
					break;
				case StatusWeb.DELIVERED:
					if (order.statusWeb !== StatusWeb.SENT) {
						throw new BadRequestException(
							'El pedido no puede ser procesado, estado inválido',
						);
					}
					break;

				case StatusWeb.CANCELLED:
					if ([StatusWeb.DELIVERED, StatusWeb.SENT].includes(order.statusWeb)) {
						throw new BadRequestException(
							'El pedido no puede ser cancelado, ya se encuentra finalizado',
						);
					}
					newStatus = StatusOrder.CANCELLED;
					break;
				default:
					break;
			}
		}

		if (StatusOrder[newStatus]) {
			switch (order?.status) {
				case StatusOrder.OPEN:
					if (
						![StatusOrder.CANCELLED, StatusOrder.CLOSED].includes(
							StatusOrder[newStatus],
						)
					) {
						throw new BadRequestException('El pedido se encuentra abierto');
					}
					break;
				case StatusOrder.PENDDING:
					if (
						![StatusOrder.OPEN || StatusOrder.CANCELLED].includes(
							StatusOrder[newStatus],
						)
					) {
						throw new BadRequestException('El pedido se encuentra pendiente');
					}
					break;
				case StatusOrder.CANCELLED:
					throw new BadRequestException('El pedido se encuentra cancelado');
				case StatusOrder.CLOSED:
					throw new BadRequestException('El pedido se encuentra finalizado');
					break;
				default:
					break;
			}

			const payments = [];

			if (
				order.status === StatusOrder.OPEN &&
				StatusOrder[newStatus] === StatusOrder.CLOSED
			) {
				for (let i = 0; i < order?.payments?.length; i++) {
					const { total, payment } = order?.payments[i];
					if (payment?.type !== TypePayment.CREDIT) {
						const valuesReceipt = {
							value: total,
							paymentId: payment?._id?.toString(),
							pointOfSaleId: order.pointOfSale._id.toString(),
							concept: `Abono a pedido ${order?.number}`,
							boxId:
								payment?.type === 'cash'
									? order?.pointOfSale['box']?.toString()
									: undefined,
						};

						const { receipt } = await this.receiptsService.create(
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

						await this.creditHistoryService.thawedCreditHistory(
							order?._id?.toString(),
							total,
							user,
							companyId,
						);

						const creditHistory =
							await this.creditHistoryService.addCreditHistory(
								order?._id?.toString(),
								total,
								user,
								companyId,
							);
						credit = creditHistory?.credit;
					}
				}
			}
			if (payments.length > 0) {
				dataUpdate['payments'] = payments;
			}

			dataUpdate['status'] = StatusOrder[newStatus];
		}

		let conveyorOrder;
		if (conveyorId) {
			const conveyor = await this.conveyorsService.findById(conveyorId);
			if (!conveyor) {
				throw new NotFoundException('El transportista no existe');
			}
			try {
				const value = await this.conveyorsService.calculateValue(
					conveyor as Conveyor,
					order as Order,
				);

				conveyorOrder = {
					conveyor,
					value,
				};
			} catch (e) {
				conveyorOrder = {
					conveyor,
					value: conveyor.defaultPrice,
					error: 'Error en api externa',
				};
			}
			let totalOrder = order.summary.total;
			if (order?.conveyorOrder?.conveyor) {
				totalOrder = totalOrder - order.conveyorOrder.value;
			}

			newSummary = {
				...order.summary,
				total: totalOrder + conveyorOrder.value,
			};
		}

		if (StatusOrder[newStatus] === StatusOrder.CANCELLED) {
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

		let newStatusWeb = statusWeb;

		if (
			order.status === StatusOrder.PENDDING &&
			newStatus === StatusOrder.OPEN
		) {
			const isCredit = order.payments.find(
				({ payment }) => payment.type === TypePayment.CREDIT,
			);

			if (order.payments.length === 0) {
				throw new BadRequestException(
					'El pedido debe contener un médio de pago',
				);
			}

			if (isCredit) {
				newStatusWeb = StatusWeb.PENDDING_CREDIT;

				/*	await this.creditHistoryService.frozenCreditHistory(
					orderId,
					isCredit.total,
					user,
					companyId,
				);*/
			} else {
				newStatusWeb = StatusWeb.PENDDING;
			}

			const details = order.details.map((detail) => ({
				productId: detail?.product?._id.toString(),
				quantity: detail?.quantity,
			}));
			if (
				order?.summary?.total > 300000 &&
				order?.customer?.customerType['name'] === 'Detal'
			) {
				const customerTypeWholesale = await this.customerTypesService.findOne(
					'Mayorista',
				);

				for (let i = 0; i < order?.details?.length; i++) {
					const detail = order?.details[i];

					const discount = await this.discountRulesService.getDiscount({
						customerTypeId: customerTypeWholesale?._id?.toString(),
						reference: detail?.product?.reference as any,
						companyId,
					});

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
				if (total >= 300000) {
					const discountTotal = newDetails.reduce(
						(sum, detail) => sum + detail.quantity * detail.discount,
						0,
					);

					const subtotal = total + discountTotal;

					const tax = 0;

					newSummary = {
						...order.summary,
						total: total + (order?.conveyorOrder?.value || 0),
						discount: discountTotal,
						subtotal: subtotal,
						tax,
					};
				} else {
					newDetails = [];
				}
			}

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

		if ([StatusOrder[newStatus], newStatus].includes(StatusOrder.CLOSED)) {
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

			const customerType = await this.customerTypesService.findOne('Mayorista');

			if (
				!order.orderPos &&
				order.summary.totalPaid >= 300000 &&
				order.customer.customerType._id !== customerType._id
			) {
				if (!customerType) {
					throw new BadRequestException('Cliente tipo Mayorista no existe');
				}

				await this.customersService.update(
					order.customer._id.toString(),
					{
						customerTypeId: customerType._id.toString(),
					},
					user,
				);
			}
		}

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					...dataUpdate,
					status: StatusOrder[newStatus] || newStatus,
					details: newDetails.length > 0 ? newDetails : undefined,
					summary: newSummary,
					statusWeb: StatusWeb[newStatusWeb] || newStatusWeb,
					user,
					conveyorOrder,
				},
			},
			{
				populate,
				new: true,
				lean: true,
			},
		);

		try {
			credit = await this.creditsService.findOne({
				customerId: newOrder?.customer?._id?.toString(),
			});
			await this.statusWebHistoriesService.addRegister({
				orderId,
				status: StatusWeb[newStatusWeb] || newStatusWeb,
				user,
			});
		} catch {}

		return {
			credit,
			order: newOrder,
		};
	}

	/**
	 * @description obtiene los pedidos del punto de venta
	 * @param idPointOfSale punto de venta
	 * @returns pedidos del punto de venta
	 */
	async getByPointOfSales(user: User) {
		if (!user?.pointOfSale?._id) {
			throw new NotFoundException(
				'El usuario no tiene punto de venta asignado',
			);
		}

		if (dayjs().isBefore(dayjs(user?.pointOfSale['closeDate']).add(1, 'd'))) {
			throw new NotFoundException(
				`El punto de venta se encuentra cerrado para el día ${dayjs(
					user?.pointOfSale['closeDate'],
				).format('DD/MM/YYYY')}`,
			);
		}

		return this.orderModel
			.find({
				pointOfSale: user.pointOfSale?._id,
				status: StatusOrder.OPEN,
				orderPos: true,
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
						$in: [StatusOrder.CLOSED],
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

		return {
			summaryOrder: {
				quantityClosed: ordersClosed[0]?.total || 0,
				quantityOpen: ordersOpen[0]?.total || 0,
				quantityCancel: ordersCancel[0]?.total || 0,
				value: ordersClosed[0]?.value || 0,
			},
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

		if (![StatusOrder.OPEN, StatusOrder.PENDDING].includes(order?.status)) {
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

				productsDelete[i] = {
					...productsDelete[i],
					quantity: newDetails[index].quantity,
				};
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

				const discount = await this.discountRulesService.getDiscount({
					customerId: order?.customer?._id.toString(),
					reference: product?.reference as any,
					companyId,
				});

				newDetails.push({
					product,
					status: StatusOrderDetail.NEW,
					quantity,
					quantityReturn: 0,
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

		let summary = {
			...order.summary,
			total: total + (order?.conveyorOrder?.value || 0),
			discount,
			subtotal,
			tax,
		};

		if (
			!order?.orderPos &&
			order?.status === StatusOrder.OPEN &&
			order?.customer?.customerType['name'] === 'Detal'
		) {
			const customerTypeWholesale = await this.customerTypesService.findOne(
				'Mayorista',
			);
			const details = [...newDetails];
			newDetails = [];
			for (let i = 0; i < details.length; i++) {
				const detail = details[i];

				const discount = await this.discountRulesService.getDiscount({
					customerTypeId: customerTypeWholesale?._id?.toString(),
					reference: detail?.product?.reference as any,
					companyId,
				});

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
			if (total >= 300000) {
				const discountTotal = newDetails.reduce(
					(sum, detail) => sum + detail.quantity * detail.discount,
					0,
				);

				const subtotal = total + discountTotal;

				const tax = 0;

				summary = {
					...order.summary,
					total: total + (order?.conveyorOrder?.value || 0),
					discount: discountTotal,
					subtotal,
					tax,
				};
			} /*else {
				newDetails = [];
			}*/
		}

		const newOrder = await this.orderModel.findByIdAndUpdate(
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

		let credit;
		try {
			credit = await this.creditsService.findOne({
				customerId: newOrder?.customer?._id.toString(),
			});
		} catch {}

		return {
			credit,
			order: newOrder,
		};
	}

	async confirmProducts(
		{ details, orderId }: ConfirmProductsOrderInput,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId).lean();

		if (user.username !== 'admin' && order.company.toString() !== companyId) {
			throw new UnauthorizedException(
				'El usuario no tiene permisos para actualizar el pedido',
			);
		}

		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}

		if (![StatusOrder.OPEN].includes(order?.status)) {
			throw new BadRequestException(
				`El pedido ${order.number} ya se encuentra procesado`,
			);
		}

		const newDetails = [...order.details];

		for (let i = 0; i < details.length; i++) {
			const { productId, status } = details[i];

			const index = newDetails.findIndex(
				(detail) => detail.product._id.toString() === productId,
			);

			if (index < 0) {
				throw new BadRequestException({
					message: 'Uno de los productos no existe en el pedido',
					data: productId,
				});
			}

			newDetails[index] = {
				...newDetails[index],
				status: StatusOrderDetail[status],
			};
		}

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					details: newDetails,
					user,
				},
			},
			{
				new: true,
				populate,
				lean: true,
			},
		);

		let credit;
		try {
			credit = await this.creditsService.findOne({
				customerId: newOrder?.customer?._id.toString(),
			});
		} catch {}

		return {
			credit,
			order: newOrder,
		};
	}

	async confirmPayments(
		{ payments, orderId }: ConfirmPaymentsOrderInput,
		user: User,
		companyId: string,
	) {
		const order = await this.orderModel.findById(orderId).lean();

		if (user.username !== 'admin' && order.company.toString() !== companyId) {
			throw new UnauthorizedException(
				'El usuario no tiene permisos para actualizar el pedido',
			);
		}
		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}

		if (![StatusOrder.OPEN].includes(order?.status)) {
			throw new BadRequestException(
				`El pedido ${order.number} ya se encuentra procesado`,
			);
		}

		const newPayments = [...order.payments];

		for (let i = 0; i < payments.length; i++) {
			const { paymentId, status } = payments[i];

			const index = newPayments.findIndex(
				(payment) => payment.payment._id.toString() === paymentId,
			);

			if (index < 0) {
				throw new BadRequestException({
					message: 'Uno de los pagos no existe en el pedido',
					data: paymentId,
				});
			}

			newPayments[index] = {
				...newPayments[index],
				status: StatusOrderDetail[status],
			};
		}

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					payments: newPayments,
					user,
				},
			},
			{
				new: true,
				populate,
				lean: true,
			},
		);

		let credit;
		try {
			credit = await this.creditsService.findOne({
				customerId: newOrder?.customer?._id.toString(),
			});
		} catch {}

		return {
			credit,
			order: newOrder,
		};
	}

	async addPayments({ orderId, payments }: AddPaymentsOrderInput, user: User) {
		const order = await this.orderModel.findById(orderId).lean();

		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}

		if (![StatusOrder.OPEN, StatusOrder.PENDDING].includes(order?.status)) {
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

				if (newPayments[index]?.payment?.type === TypePayment.CREDIT) {
					await this.creditHistoryService.thawedCreditHistory(
						orderId,
						newPayments[index]?.total,
						user,
						order.company?.toString(),
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
						`El medio de pago ${detail.paymentId} no existe en el pedido ${order?.number}`,
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

		for (let i = 0; i < paymentsCreate.length; i++) {
			const { paymentId } = paymentsCreate[i];
			const payment = await this.paymentsService.findById(paymentId);

			if (!payment.active) {
				throw new BadRequestException(
					`El medio de pago ${payment.name} se encuentra inactivo`,
				);
			}
		}
		let credit;
		if (paymentsCreate) {
			for (let i = 0; i < paymentsCreate.length; i++) {
				const detail = paymentsCreate[i];

				const index = newPayments.findIndex(
					(item) => item.payment._id.toString() === detail.paymentId,
				);

				if (index >= 0) {
					throw new BadRequestException(
						`El medio de pago ${newPayments[index].payment.name} ya existe en la orden ${order?.number} y no se puede agregar`,
					);
				}
			}

			for (let i = 0; i < paymentsCreate.length; i++) {
				const detailPayment = paymentsCreate[i];
				const payment = await this.paymentsService.findById(
					detailPayment.paymentId,
				);

				if (payment.type === TypePayment.CREDIT) {
					try {
						credit = await this.creditsService.findOne({
							customerId: order?.customer?._id.toString(),
						});
					} catch {}
					if (credit?.status !== StatusCredit.ACTIVE) {
						throw new BadRequestException(
							'El crédito del cliente se encuentra suspendido',
						);
					}
				}

				newPayments.push({
					payment,
					code: detailPayment.code,
					total: detailPayment.total,
					status: StatusOrderDetail.NEW,
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

		const change =
			totalPaid - order.summary.total > 0 ? totalPaid - order.summary.total : 0;

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

		const creditOrder = order.payments.find(
			(item) => item.payment?.type === TypePayment.CREDIT,
		);

		const creditUpdate = payments.find(
			(item) => item.paymentId === creditOrder?.payment?._id.toString(),
		);

		const newCredit = newPayments.find(
			(item) => item.payment?.type === TypePayment.CREDIT,
		);

		if (creditUpdate) {
			await this.creditHistoryService.thawedCreditHistory(
				orderId,
				creditOrder.total,
				user,
				order.company._id.toString(),
			);

			await this.creditHistoryService.frozenCreditHistory(
				orderId,
				creditUpdate.total,
				user,
				order.company._id.toString(),
			);
		} else if (newCredit) {
			await this.creditHistoryService.frozenCreditHistory(
				orderId,
				newCredit.total,
				user,
				order.company._id.toString(),
			);
		}

		const summary = {
			...order.summary,
			totalPaid,
			change,
		};

		const newOrder = await this.orderModel.findByIdAndUpdate(
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

		return {
			credit,
			order: newOrder,
		};
	}

	async updateProducts(id: string, details: DetailOrder[]) {
		return this.orderModel.findByIdAndUpdate(id, {
			$set: { details },
		});
	}
}

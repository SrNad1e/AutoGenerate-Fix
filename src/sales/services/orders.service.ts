import { Box } from 'src/treasury/entities/box.entity';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';

import { Conveyor } from 'src/configurations/entities/conveyor.entity';
import { User } from 'src/configurations/entities/user.entity';
import { ConveyorsService } from 'src/configurations/services/conveyors.service';
import { ShopsService } from 'src/configurations/services/shops.service';
import {
	TypeCreditHistory,
	TypeDocument,
} from 'src/credits/entities/credit-history.entity';
import { StatusCredit } from 'src/credits/entities/credit.entity';
import { CreditHistoryService } from 'src/credits/services/credit-history.service';
import { CreditsService } from 'src/credits/services/credits.service';
import { StatusCoupon } from 'src/crm/entities/coupon.entity';
import { Customer } from 'src/crm/entities/customer.entity';
import { CouponsService } from 'src/crm/services/coupons.service';
import { CustomerTypeService } from 'src/crm/services/customer-type.service';
import { CustomersService } from 'src/crm/services/customers.service';
import { DiscountRulesService } from 'src/crm/services/discount-rules.service';
import { DocumentTypeStockHistory } from 'src/inventories/dtos/create-stockHistory-input';
import { StockHistoryService } from 'src/inventories/services/stock-history.service';
import { StatusProduct } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/services/products.service';
import { ResponseReportSales } from 'src/reports/dtos/response-report-sales';
import { TypePayment } from 'src/treasury/entities/payment.entity';
import { StatusReceipt } from 'src/treasury/entities/receipt.entity';
import { PaymentsService } from 'src/treasury/services/payments.service';
import { ReceiptsService } from 'src/treasury/services/receipts.service';
import {
	ActionPaymentsOrder,
	AddPaymentsOrderInput,
} from '../dtos/add-payments-order-input';
import {
	ActionProductsOrder,
	AddProductsOrderInput,
} from '../dtos/add-products-order-input';
import { ConfirmPaymentsOrderInput } from '../dtos/confirm-payments-order.input';
import { ConfirmProductsOrderInput } from '../dtos/confirm-products-order.input';
import { CreateOrderInput } from '../dtos/create-order-input';
import { DataGetPaymentsOrderInput } from '../dtos/data-get-payments-order.input';
import { DataGetNetSalesInput } from '../dtos/data-net-sales.input';
import { FiltersOrdersInput } from '../dtos/filters-orders.input';
import {
	FiltersSalesReportInput,
	GroupDates,
} from '../dtos/filters-sales-report.input';
import { UpdateOrderInput } from '../dtos/update-order-input';
import { Invoice } from '../entities/invoice.entity';
import {
	DetailOrder,
	Order,
	PaymentOrder,
	StatusOrder,
	StatusOrderDetail,
} from '../entities/order.entity';
import { PointOfSale } from '../entities/pointOfSale.entity';
import { StatusWeb } from '../entities/status-web-history';
import { StatusWebHistoriesService } from './status-web-histories.service';

const populate = [
	{
		path: 'invoice',
		model: Invoice.name,
	},
	{
		path: 'pointOfSale',
		populate: {
			path: 'box',
			model: Box.name,
		},
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
			shopId,
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
			filters.statusWeb = StatusWeb[statusWeb] || statusWeb;
		}

		if (nonStatus?.length > 0) {
			filters.status = {
				$not: { $in: nonStatus.map((item) => StatusOrder[item]) },
			};
		}

		if (orderPos !== undefined) {
			filters.orderPos = orderPos;
		}

		if (shopId) {
			filters['shop._id'] = new Types.ObjectId(shopId);
		}

		if (dateInitial) {
			if (!dateFinal) {
				throw new BadRequestException('Debe enviarse una fecha final');
			}

			filters['closeDate'] = {
				$gte: new Date(dayjs(dateInitial).format('YYYY/MM/DD')),
				$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
			};
		} else if (dateFinal) {
			if (!dateInitial) {
				throw new BadRequestException('Debe enviarse una fecha inicial');
			}
			filters['closeDate'] = {
				$gte: new Date(dayjs(dateInitial).format('YYYY/MM/DD')),
				$lt: new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD')),
			};
		}

		if (number) {
			filters.$or = [{ number }, { invoiceNumber: number }];
		}

		if (customerId) {
			filters['customer._id'] = new Types.ObjectId(customerId);
		}

		if (paymentId) {
			filters['payments.payment._id'] = new Types.ObjectId(paymentId);
		}

		const options: PaginateOptions = {
			limit,
			page,
			sort,
			populate,
			lean: true,
			allowDiskUse: true,
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

	async create(
		{ status, shopId }: CreateOrderInput,
		user: User,
		companyId: string,
	) {
		const newStatus = StatusOrder[status] || status;

		//Se valida el estado enviado por el usuario
		if (![StatusOrder.OPEN, StatusOrder.PENDDING].includes(newStatus)) {
			throw new BadRequestException('El estado del pedido no es correcto');
		}

		//Si es un pedido POS
		if (user?.pointOfSale && newStatus === StatusOrder.OPEN) {
			//Inicia validación del punto de venta
			if (
				dayjs().isBefore(
					dayjs(dayjs(user.pointOfSale['closeDate']).format('YYYY/MM/DD')).add(
						1,
						'd',
					),
				)
			) {
				throw new NotFoundException(
					`El punto de venta se encuentra cerrado para el día ${dayjs(
						user?.pointOfSale['closeDate'],
					).format('DD/MM/YYYY')}`,
				);
			}
			//Fin validación del punto de venta

			//Consulta del cliente por defecto
			const customer = await this.customersService.getCustomerDefault();

			if (!customer) {
				throw new BadRequestException(
					'La compañia no tiene asignado un cliente por defecto',
				);
			}

			//Se consulta la tienda asignada al punto de venta
			const shop = await this.shopsService.findById(
				user.pointOfSale['shop']['_id'].toString(),
			);

			if (!shop) {
				throw new BadRequestException(
					`La tienda de punto de venta ${user.pointOfSale['name']} no existe`,
				);
			}

			const number = await this.generateNumber(companyId);

			const summary = this.calculateSummary({});
			//Se crea el nuevo pedido
			const newOrder = await this.orderModel.create({
				customer,
				shop,
				summary,
				number,
				company: new Types.ObjectId(companyId),
				closeDate: new Date(),
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
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

		//Si es un pedido WEB

		//Se valida si el usuario tiene algun pedido abierto
		const oldOrder = await this.orderModel.findOne({
			'customer._id': user.customer._id,
			status: StatusOrder.PENDDING,
		});

		//Si lo tiene abierto se regresa ese pedido y no se crea un pedido nuevo
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

		//Si no tiene pedido se procede a organizar la creación

		const shop = await this.shopsService.getShopWholesale(shopId);

		const number = await this.generateNumber(companyId);

		//Se asigna la dirección principal del cliente si la tiene
		const address =
			user?.customer['addresses']?.length > 0
				? user?.customer['addresses']?.find((address) => address?.isMain)
				: undefined;

		const summary = await this.calculateSummary({});

		//Se crea el nuevo pedido
		const newOrder = await this.orderModel.create({
			customer: user.customer,
			address,
			summary,
			shop,
			closeDate: new Date(),
			orderPos: false,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			number,
			status: StatusOrder.PENDDING,
			statusWeb: StatusWeb.OPEN,
			company: new Types.ObjectId(companyId),
		});

		//Se realiza el registro del historial del pedido
		await this.statusWebHistoriesService.addRegister({
			orderId: newOrder._id.toString(),
			status: StatusWeb.OPEN,
			user,
		});

		const credit = this.getCreditCustomer(newOrder?.customer?._id?.toString());

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
		//se realiza la validación del pedido
		const order = await this.orderModel
			.findById(orderId)
			.populate(populate)
			.lean();

		if (!order) {
			throw new BadRequestException(
				'El pedido que intenta actualizar no existe',
			);
		}

		let newStatus = StatusOrder[status] || status;
		let newStatusWeb = StatusWeb[statusWeb] || statusWeb;
		const newDetails: DetailOrder[] = [];
		const dataUpdate: Partial<Order> = {};
		let newPayments = [];

		//Se valida si se realiza cambio del cliente
		if (customerId) {
			const customer = await this.customersService.findById(customerId);
			if (!customer?._id) {
				throw new NotFoundException('El cliente seleccionado no existe');
			}

			if (!customer.active) {
				throw new NotFoundException('El cliente se encuentra inactivo');
			}

			dataUpdate.customer = customer as Customer;

			if (
				customer.customerType._id.toString() !==
				order.customer.customerType._id.toString()
			) {
				//Se actualiza el precio y el descuento de los productos
				for (let i = 0; i < order?.details?.length; i++) {
					const detail = order?.details[i];

					const discount = await this.discountRulesService.getDiscount({
						customerId: customer._id.toString(),
						reference: detail?.product?.reference as any,
						shopId: order?.shop?._id?.toString(),
						companyId,
					});

					newDetails.push({
						...detail,
						price: detail?.product?.reference['price'] - discount,
						discount,
						updatedAt: new Date(),
					} as DetailOrder);
				}
			}
		}

		//Se valida sei realiza un cambio o agregado de transportista
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

				dataUpdate.conveyorOrder = {
					conveyor: conveyor as Conveyor,
					value,
				};
			} catch (e) {
				dataUpdate.conveyorOrder = {
					conveyor: conveyor as Conveyor,
					value: conveyor.defaultPrice,
					error: 'Error en api externa',
				};
			}
		}

		//Validación del cambio de estado Web
		if (newStatusWeb) {
			switch (newStatusWeb) {
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

		if (newStatus) {
			//Validación de los estados
			switch (order?.status) {
				case StatusOrder.OPEN:
					if (
						![StatusOrder.CANCELLED, StatusOrder.CLOSED].includes(newStatus)
					) {
						throw new BadRequestException('El pedido se encuentra abierto');
					}
					break;
				case StatusOrder.PENDDING:
					if (
						![StatusOrder.OPEN || StatusOrder.CANCELLED].includes(newStatus)
					) {
						throw new BadRequestException('El pedido se encuentra pendiente');
					}
					break;
				case StatusOrder.CANCELLED:
					throw new BadRequestException('El pedido se encuentra cancelado');
				case StatusOrder.CLOSED:
					throw new BadRequestException('El pedido se encuentra finalizado');
				default:
					break;
			}

			//Si se procede a abrir el pedido

			if (StatusOrder.OPEN === newStatus) {
				if (order.payments.length === 0) {
					throw new BadRequestException(
						'El pedido debe contener un médio de pago',
					);
				}

				if (
					order.summary.total < 300000 &&
					order.customer.customerType['name'] === 'Detal'
				) {
					throw new BadRequestException(
						'El monto debe ser superior o igual a $ 300.000 si no eres cliente mayorista',
					);
				}

				const isCredit = order.payments.find(
					({ payment }) => payment.type === TypePayment.CREDIT,
				);

				if (isCredit) {
					newStatusWeb = StatusWeb.PENDDING_CREDIT;
				} else {
					newStatusWeb = StatusWeb.PENDDING;
				}

				//Reservar los productos de inventario
				if (!order.orderPos) {
					const detailsDelete = order.details.map(({ product, quantity }) => ({
						productId: product?._id?.toString(),
						quantity,
					}));

					await this.stockHistoryService.deleteStock(
						{
							details: detailsDelete,
							warehouseId: order?.shop?.defaultWarehouse?._id?.toString(),
							documentId: order?._id?.toString(),
							documentType: DocumentTypeStockHistory.ORDER,
						},
						user,
						companyId,
					);
				}
			}

			//Si se procede a cancelar el pedido
			if (StatusOrder.CANCELLED === newStatus) {
				//se validan que no se hallan confirmado pagos

				const paymentsConfirm = !!order.payments.find(
					({ status }) => status === StatusOrderDetail.CONFIRMED,
				);

				if (paymentsConfirm) {
					throw new BadRequestException(
						'El pedido no puede ser cancelado, ya hay pagos confirmados',
					);
				}

				if ([StatusOrder.OPEN, StatusOrder.PENDDING].includes(order?.status)) {
					const details = order?.details?.map((detail) => ({
						productId: detail?.product?._id.toString(),
						quantity: detail?.quantity,
					}));

					//Se reversan los inventarios
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

					//se descongelan los créditos
					const credit = order.payments.find(
						({ payment }) => payment.type === TypePayment.CREDIT,
					);

					if (credit) {
						await this.creditHistoryService.thawedCreditHistory(
							order?.number,
							credit.total,
							user,
							companyId,
						);
					}
				} else {
					throw new BadRequestException(
						'El pedido ya está siendo procesado y no puede cancelarse',
					);
				}
			}

			//Si se procede a cerrar el pedido
			if (newStatus === StatusOrder.CLOSED) {
				//Calcular el resumen
				const newSummary = await this.calculateSummary({
					...(order as Order),
					...dataUpdate,
					details:
						newDetails.length > 0
							? (newDetails as DetailOrder[])
							: (order.details as DetailOrder[]),
				});

				if (newSummary.total > newSummary.totalPaid) {
					throw new BadRequestException(
						'El pedido aun no se encuentra pagado, valide los medios de pago e intente nuevamente',
					);
				}

				//Validamos que el usuario que finaliza el proceso tenga punto de venta
				if (!order.orderPos) {
					if (!user.pointOfSale) {
						throw new BadRequestException(
							'El usuario no tiene punto de venta asignado',
						);
					}

					dataUpdate.pointOfSale = user?.pointOfSale?._id;
				}

				const paymentsForProcess = [];

				//Se crean los recibos de caja
				for (let i = 0; i < order?.payments?.length; i++) {
					const payment = order?.payments[i];

					if (payment?.status === StatusOrderDetail.NEW) {
						paymentsForProcess.push({
							...payment,
							status: StatusOrderDetail.CONFIRMED,
						});
					}
				}

				const pointOfSale = order.pointOfSale || user.pointOfSale;

				if (paymentsForProcess.length > 0) {
					const paymentsProccess = await this.proccessPayments(
						paymentsForProcess,
						pointOfSale as unknown as PointOfSale,
						order as Order,
						user,
						companyId,
						order.customer._id.toString(),
					);

					newPayments = newPayments.concat(paymentsProccess);
				}

				//Se pasa el cliente a mayoristas
				const customerType = await this.customerTypesService.findOne(
					'Mayorista',
				);

				dataUpdate.closeDate = new Date();

				if (
					!order.orderPos &&
					newSummary.totalPaid >= 300000 &&
					order.customer.customerType['name'] === 'Detal'
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
		}

		//Si se cambia el estado del pedido web agrega el historico
		if (newStatusWeb !== order.statusWeb) {
			await this.statusWebHistoriesService.addRegister({
				orderId,
				status: newStatusWeb,
				user,
			});
		}

		const newSummary = this.calculateSummary({
			...(order as Order),
			...dataUpdate,
			details:
				newDetails.length > 0
					? (newDetails as DetailOrder[])
					: (order.details as DetailOrder[]),
		});

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					...dataUpdate,
					status: newStatus,
					details: newDetails.length > 0 ? newDetails : undefined,
					summary: newSummary,
					payments: newPayments.length > 0 ? newPayments : undefined,
					statusWeb: newStatusWeb,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
					address,
				},
			},
			{
				populate,
				new: true,
				lean: true,
			},
		);

		const credit = await this.getCreditCustomer(
			newOrder?.customer?._id?.toString(),
		);

		return {
			credit,
			order: newOrder,
		};
	}

	async addProducts(
		{ orderId, details, isWholesaler = false }: AddProductsOrderInput,
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

		//Seleccionamos los productos a eliminar
		const productsDelete = details?.filter(
			(item) => ActionProductsOrder[item.action] === ActionProductsOrder.DELETE,
		);

		//validamos si hay productos a eliminar
		if (productsDelete) {
			//Validamos si el producto existe
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

			//Eliminamos los productos
			newDetails = newDetails.filter(
				(item) => !products.includes(item.product._id.toString()),
			);
		}

		//Seleccionamos los productos a actualizar
		const productsUpdate = details?.filter(
			(item) => ActionProductsOrder[item.action] === ActionProductsOrder.UPDATE,
		);

		//Validamos si hay productos a actualizar
		if (productsUpdate) {
			//Validamos que el producto exista
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

				//Validamos la disponibilidad de stock total si el pedido está pendding o si no la cantidad de más
				let product;

				if (order.status === StatusOrder.PENDDING) {
					if (quantity > newDetails[index].quantity) {
						product = await this.productsService.validateStock(
							productId,
							quantity,
							order?.shop?.defaultWarehouse._id.toString(),
						);
					} else {
						product = newDetails[index].product;
					}
				} else if (quantity > newDetails[index].quantity) {
					product = await this.productsService.validateStock(
						productId,
						quantity - newDetails[index].quantity,
						order?.shop?.defaultWarehouse._id.toString(),
					);
				} else {
					product = newDetails[index].product;
				}

				if (!product) {
					throw new BadRequestException(`El producto ${productId}, no existe`);
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

		//Seleccionamos los productos a actualizar
		const productsCreate = details?.filter(
			(item) => ActionProductsOrder[item.action] === ActionProductsOrder.CREATE,
		);

		//Validamos si hay productos para crear
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
					throw new BadRequestException(`El producto ${productId}, no existe`);
				}

				if (product?.status !== StatusProduct.ACTIVE) {
					throw new BadRequestException(
						`El producto ${product?.barcode} no se encuentra activo`,
					);
				}

				newDetails.push({
					product,
					status: StatusOrderDetail.NEW,
					quantity,
					quantityReturn: 0,
					price: product.reference['price'],
					discount: 0,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		}

		if (order?.status === StatusOrder.OPEN) {
			//Seleccionamos las unidades a eliminar o a agregar en el inventario
			for (let i = 0; i < productsUpdate.length; i++) {
				const product = productsUpdate[i];

				const quantityOld = order.details.find(
					(item) => item.product._id.toString() === product.productId,
				)?.quantity;

				productsDelete.push({ ...product, quantity: quantityOld });

				productsCreate.push(product);
			}

			//Eliminamos el inventario de las bodegas si se encuentra en open
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

		//generamos el descuento si es mayorista pedido
		const newDetailswholesaler = [];
		const customerType = await this.customerTypesService.findOne('Mayorista');
		if (!customerType) {
			throw new BadRequestException('El tipo de cliente Mayorista no existe');
		}

		for (let i = 0; i < newDetails.length; i++) {
			const { product, price, discount } = newDetails[i];
			let newDiscount = 0;
			if (isWholesaler && order.customer.customerType['name'] === 'Detal') {
				newDiscount = await this.discountRulesService.getDiscount({
					customerTypeId: customerType?._id.toString(),
					reference: product?.reference as any,
					shopId: order?.shop?._id?.toString(),
					companyId,
				});
				newDetailswholesaler[i] = {
					...newDetails[i],
					price: price + discount - newDiscount,
					discount: newDiscount,
				};
			} else {
				newDiscount = await this.discountRulesService.getDiscount({
					customerId: order?.customer?._id.toString(),
					reference: product?.reference as any,
					shopId: order?.shop?._id?.toString(),
					companyId,
				});

				newDetails[i] = {
					...newDetails[i],
					price: price + discount - newDiscount,
					discount: newDiscount,
				};
			}
		}

		if (
			isWholesaler &&
			order.customer.customerType['name'] === 'Detal' /*&&
			newDetailswholesaler.reduce(
				(sum, item: DetailOrder) => sum + item.price * item.quantity,
				0,
			) >= 300000*/
		) {
			newDetails = newDetailswholesaler;
		}

		const summary = this.calculateSummary({
			...(order as Order),
			details: newDetails as DetailOrder[],
		});

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					details: newDetails,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
					summary,
				},
			},
			{
				populate,
				new: true,
				lean: true,
			},
		);

		const credit = await this.getCreditCustomer(
			order?.customer?._id?.toString(),
		);

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

		//Se valida y confirma los productos
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

		let newStatusWeb;

		if (order.statusWeb !== StatusWeb.PREPARING) {
			await this.statusWebHistoriesService.addRegister({
				orderId,
				status: StatusWeb.PREPARING,
				user,
			});
			newStatusWeb = StatusWeb.PREPARING;
		}

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					details: newDetails,
					statusWeb: newStatusWeb,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
				},
			},
			{
				new: true,
				populate,
				lean: true,
			},
		);

		const credit = await this.getCreditCustomer(
			order?.customer?._id?.toString(),
		);

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

		let creditUpdate;
		let creditNew;
		let creditDelete;

		//Se valida que los medios de pago no vengan nulos o en 0
		for (let i = 0; i < payments.length; i++) {
			const { total, paymentId, action } = payments[i];

			if (total <= 0) {
				throw new BadRequestException(
					`Los medios de pago no pueden ser menores o iguales a 0`,
				);
			}
			const payment = await this.paymentsService.findById(paymentId);

			if (!payment) {
				throw new BadRequestException(
					`El medio de pago ${paymentId} no existe`,
				);
			}

			if (payment.type === TypePayment.CREDIT) {
				const actionPayment = ActionPaymentsOrder[action] || action;

				switch (actionPayment) {
					case ActionPaymentsOrder.CREATE:
						creditNew = {
							payment,
							total,
						};
						break;
					case ActionPaymentsOrder.UPDATE:
						creditUpdate = {
							payment,
							total,
						};
						break;
					case ActionPaymentsOrder.DELETE:
						creditDelete = {
							payment,
							total,
						};
						break;
					default:
						break;
				}
			}
		}

		//se valida si hay bono debe ser menor al total de la factura
		/*
		const validateBonus = payments.find((payment) => payment.code);

		const paymentSurplus = payments.reduce(
			(sum, payment) => sum + payment.total,
			0,
		);

		if (
			validateBonus &&
			paymentSurplus >= order.summary.total &&
			payments.length > 1
		) {
			throw new BadRequestException(
				`El valor del bono no puede combinar con otros medios de pagos si es mayor o igual al valor del pedido`,
			);
		}*/

		let newPayments = [...order.payments];

		//Se seleccionan los medios de pago a eliminar
		const paymentsDelete = payments?.filter(
			(item) => ActionPaymentsOrder[item.action] === ActionPaymentsOrder.DELETE,
		);

		//Se eliminan los medios de pago
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

		//Se seleccionan los medios de pago a actualizar
		const paymentsUpdate = payments?.filter(
			(item) => ActionPaymentsOrder[item.action] === ActionPaymentsOrder.UPDATE,
		);

		//Se actualizan los medios de pago
		if (paymentsUpdate) {
			for (let i = 0; i < paymentsUpdate.length; i++) {
				const { paymentId } = paymentsUpdate[i];

				const index = newPayments.findIndex(
					(item) => item.payment._id.toString() === paymentId,
				);

				if (index < 0) {
					throw new BadRequestException(
						`El medio de pago ${paymentId} no existe en el pedido ${order?.number}`,
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

		//Se seleccionan los mediois de pago a crear
		const paymentsCreate = payments?.filter(
			(item) => ActionPaymentsOrder[item.action] === ActionPaymentsOrder.CREATE,
		);

		//Se valida el estado del medio de pago antes de agregarlo
		for (let i = 0; i < paymentsCreate.length; i++) {
			const { paymentId } = paymentsCreate[i];
			const payment = await this.paymentsService.findById(paymentId);

			if (!payment.active) {
				throw new BadRequestException(
					`El medio de pago ${payment.name} se encuentra inactivo`,
				);
			}
		}

		if (paymentsCreate) {
			for (let i = 0; i < paymentsCreate.length; i++) {
				const { paymentId } = paymentsCreate[i];

				const index = newPayments.findIndex(
					(item) => item.payment._id.toString() === paymentId,
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
					let credit;
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

		//Cambios en la cartera
		const creditOrder = order.payments.find(
			(item) => item.payment?.type === TypePayment.CREDIT,
		);

		if (creditUpdate) {
			await this.creditHistoryService.thawedCreditHistory(
				order.number,
				creditOrder.total,
				user,
				order.company._id.toString(),
			);

			await this.creditHistoryService.frozenCreditHistory(
				order.number,
				creditUpdate.total,
				user,
				order.company._id.toString(),
			);
		} else if (creditNew) {
			await this.creditHistoryService.frozenCreditHistory(
				order.number,
				creditNew.total,
				user,
				order.company._id.toString(),
			);
		} else if (creditDelete) {
			await this.creditHistoryService.thawedCreditHistory(
				order.number,
				creditOrder.total,
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
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
					summary,
				},
			},
			{
				populate,
				lean: true,
				new: true,
			},
		);
		const credit = await this.getCreditCustomer(
			newOrder?.customer?._id._bsontype.toString(),
		);

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

		const paymentIds = payments.map((p) => p.paymentId);

		let newPayments = order.payments.filter(
			({ payment }) => !paymentIds.includes(payment?._id?.toString()),
		);

		const paymentsForProcess = [];

		for (let i = 0; i < payments.length; i++) {
			const { paymentId, status } = payments[i];

			const index = order.payments.findIndex(
				(payment) => payment.payment._id.toString() === paymentId,
			);

			if (index < 0) {
				throw new BadRequestException({
					message: 'Uno de los pagos no existe en el pedido',
					data: paymentId,
				});
			}

			paymentsForProcess.push({ ...order.payments[index], status });
			//newPayments.splice(index, 1);
		}

		//procesar los pagos
		const pointOfSale = order.pointOfSale || user.pointOfSale;

		const paymentsProccess = await this.proccessPayments(
			paymentsForProcess,
			pointOfSale as unknown as PointOfSale,
			order as Order,
			user,
			companyId,
			order.customer._id.toString(),
		);

		newPayments = newPayments.concat(paymentsProccess);

		const newOrder = await this.orderModel.findByIdAndUpdate(
			orderId,
			{
				$set: {
					payments: newPayments,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
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

	async reportSales(
		{
			dateFinal,
			dateInitial,
			isGroupByCategory,
			groupDates,
			shopId,
		}: FiltersSalesReportInput,
		companyId: string,
	): Promise<ResponseReportSales> {
		const newGroupDates = GroupDates[groupDates] || groupDates;

		let finalDate;
		let initialDate;

		//validar la tienda
		if (shopId) {
			const shop = await this.shopsService.findById(shopId);
			if (!shop) {
				throw new BadRequestException('La tienda no existe');
			}
		}

		//generar los rangos de fechas
		switch (newGroupDates) {
			case GroupDates.DAY:
				finalDate = new Date(dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD'));

				initialDate = new Date(dayjs(dateInitial).format('YYYY/MM/DD'));
				break;

			case GroupDates.MONTH:
				finalDate = new Date(
					dayjs(dateFinal).endOf('month').format('YYYY/MM/DD'),
				);

				initialDate = new Date(
					dayjs(dateInitial).startOf('month').format('YYYY/MM/DD'),
				);
				break;

			case GroupDates.YEAR:
				finalDate = new Date(
					dayjs(dateFinal).endOf('year').format('YYYY/MM/DD'),
				);

				initialDate = new Date(
					dayjs(dateInitial).startOf('year').format('YYYY/MM/DD'),
				);
				break;

			default:
				break;
		}

		const filters = {
			company: new Types.ObjectId(companyId),
			status: StatusOrder.CLOSED,
			closeDate: {
				$gte: initialDate,
				$lte: finalDate,
			},
		};

		if (shopId) {
			filters['shop._id'] = new Types.ObjectId(shopId);
		}

		//consultar los pagos por valor y cantidad
		const paymentsSalesReport = await this.orderModel.aggregate([
			{
				$unwind: '$payments',
			},
			{
				$match: filters,
			},
			{
				$group: {
					_id: '$payments.payment._id',
					payment: { $first: '$payments.payment' },
					total: {
						$sum: '$payments.total',
					},
					quantity: {
						$sum: 1,
					},
				},
			},
			{
				$project: {
					_id: 0,
					payment: 1,
					total: 1,
					quantity: 1,
				},
			},
		]);

		//consultar las ventas por tipo de cliente
		const customersSalesReport = await this.orderModel.aggregate([
			{
				$match: filters,
			},
			{
				$group: {
					_id: '$customer.customerType._id',
					typeCustomer: { $first: '$customer.customerType' },
					total: {
						$sum: '$summary.total',
					},
					quantity: {
						$sum: 1,
					},
				},
			},
			{
				$project: {
					_id: 0,
					typeCustomer: 1,
					total: 1,
					quantity: 1,
				},
			},
		]);

		//consultar summary de ventas valor, cantidad de facturas, margen %, cmv
		const summarySalesReport = await this.orderModel.aggregate([
			{
				$unwind: '$details',
			},
			{
				$match: filters,
			},
			{
				$group: {
					_id: null,
					total: {
						$sum: {
							$multiply: ['$details.quantity', '$details.price'],
						},
					},
					quantity: {
						$sum: 1,
					},
					cost: {
						$sum: {
							$multiply: [
								'$details.quantity',
								'$details.product.reference.cost',
							],
						},
					},
				},
			},
			{
				$project: {
					_id: 0,
					total: 1,
					quantity: 1,
					cmv: {
						$subtract: ['$total', '$cost'],
					},
					margin: {
						$divide: [
							{
								$subtract: ['$total', '$cost'],
							},
							'$total',
						],
					},
				},
			},
		]);

		const aggregate = [];
		let group: any = {
			$group: {
				_id: '$shop._id',
				shop: {
					$first: '$shop',
				},
				total: {
					$sum: '$summary.total',
				},
				quantity: {
					$sum: 1,
				},
			},
		};

		//validar si es agrupado por categorías
		if (isGroupByCategory) {
			aggregate.push({
				$unwind: '$details',
			});

			group = {
				$group: {
					_id: ['$shop._id', '$details.product.reference.categoryLevel1._id'],
					category: {
						$first: '$details.product.reference.categoryLevel1',
					},
					total: {
						$sum: {
							$multiply: ['$details.quantity', '$details.price'],
						},
					},
					quantity: {
						$sum: 1,
					},
				},
			};
		}
		//consultar las ventas por valor y cantidad

		const salesReport = await this.orderModel.aggregate([
			...aggregate,
			{
				$lookup: {
					from: 'CategoryLevel1',
					localField: 'categoryLevel1',
					foreignField: '_id',
					as: 'categoryLevel1',
				},
			},
			{
				$match: filters,
			},
			{
				...group,
			},
			{
				$project: {
					_id: 0,
					shop: 1,
					category: 1,
					total: 1,
					quantity: 1,
				},
			},
		]);

		return {
			paymentsSalesReport,
			customersSalesReport,
			summarySalesReport: summarySalesReport[0],
			salesReport,
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

		if (
			dayjs().isBefore(
				dayjs(dayjs(user.pointOfSale['closeDate']).format('YYYY/MM/DD')).add(
					1,
					'd',
				),
			)
		) {
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
			.allowDiskUse(true)
			.populate(populate)
			.lean();
	}

	//* INICIAN METODOS GENERALES */

	/**
	 * @description se encarga de obtener un resumen del día
	 * @param closeDate dia del resumen
	 * @param pointOfSaleId punto de venta
	 * @returns un objeto tipo summaryOrder
	 */
	async getSummaryOrder(closeDate: string, pointOfSaleId: string) {
		const dateIntial = new Date(closeDate);
		const dateFinal = dayjs(closeDate).add(1, 'd').toDate();

		const ordersCancel: any = await this.orderModel.aggregate([
			{
				$match: {
					closeDate: {
						$gte: dateIntial,
						$lt: dateFinal,
					},
					status: StatusOrder.CANCELLED,
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: '$pointOfSale',
					total: {
						$sum: 1,
					},
				},
			},
		]);

		const aggregate = [
			{
				$match: {
					status: StatusOrder.OPEN,
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: '$pointOfSale',
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
					closeDate: {
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

		const aggregateCoupons = [
			{
				$unwind: '$payments',
			},
			{
				$match: {
					'payments.payment.type': 'bonus',
					closeDate: {
						$gte: new Date(dateIntial),
						$lt: new Date(dateFinal),
					},
					status: 'closed',
					pointOfSale: new Types.ObjectId(pointOfSaleId),
				},
			},
			{
				$group: {
					_id: ['$shop.name', '$payments.payment.type'],
					total: {
						$sum: '$payments.total',
					},
					quantity: {
						$sum: 1,
					},
				},
			},
			{
				$project: {
					_id: 0,
					total: 1,
					quantity: 1,
				},
			},
		];

		const totalCoupons = await this.orderModel.aggregate(aggregateCoupons);
		return {
			summaryOrder: {
				quantityClosed: ordersClosed[0]?.total || 0,
				quantityOpen: ordersOpen[0]?.total || 0,
				quantityCancel: ordersCancel[0]?.total || 0,
				value: ordersClosed[0]?.value || 0,
				valueCoupons: totalCoupons[0]?.total || 0,
				quantityCoupons: totalCoupons[0]?.quantity || 0,
			},
		};
	}

	/**
	 * @description actualiza todos los productos del pedido
	 * @param orderId identificador del pedido a actualizar los productos
	 * @param details productos a colocar en el pedido
	 * @returns el pedido actualizado
	 */
	async updateProducts(orderId: string, details: DetailOrder[]) {
		return this.orderModel.findByIdAndUpdate(orderId, {
			$set: { details },
		});
	}

	/**
	 * @description se encarga de generar el consecutivo para el pedido
	 * @param companyId compañía a la que va a asignado el pedido
	 * @returns número consecutivo del pedido
	 */
	async generateNumber(companyId: string) {
		let number = 1;
		const lastOrder = await this.orderModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.sort({
				number: -1,
			})
			.lean();

		if (lastOrder) {
			number = lastOrder.number + 1;
		}

		return number;
	}

	/**
	 * @description se encarga de consultar el crédito del cliente
	 * @param customerId cliente a consultar el crédito
	 * @returns si el crédito se encuentra correcto el crédito de lo contrario null
	 */
	async getCreditCustomer(customerId: string) {
		try {
			const credit = await this.creditsService.findOne({
				customerId,
			});

			if (credit.status !== StatusCredit.ACTIVE) {
				return null;
			}

			return credit;
		} catch {
			return null;
		}
	}

	/**
	 * @description se encarga de hacer el calculo del summary del pedido
	 * @param order pedido a cual realizar el calculo del summary
	 * @returns datos del summary del pedido
	 */
	calculateSummary({
		summary,
		details,
		payments,
		conveyorOrder,
	}: Partial<Order>) {
		let newTotal = 0;
		let newDiscount = 0;
		let newSubtotal = 0;
		const newChange = summary?.change || 0;
		let newTotalPaid = 0;
		const newTax = 0;

		for (let i = 0; i < details?.length; i++) {
			const { price, discount, quantity } = details[i];

			newTotal = newTotal + price * quantity;
			newDiscount = newDiscount + discount * quantity;
			newSubtotal = newSubtotal + (discount + price) * quantity;
		}

		for (let i = 0; i < payments?.length; i++) {
			const { total } = payments[i];
			newTotalPaid = newTotalPaid + total;
		}

		if (conveyorOrder?.value > 0) {
			newTotal = newTotal + conveyorOrder?.value;
		}

		return {
			total: newTotal,
			discount: newDiscount,
			subtotal: newSubtotal,
			change: newChange,
			totalPaid: newTotalPaid,
			tax: newTax,
		};
	}

	/**
	 * @description se encarga de calcular las ventas netas
	 * @param data datos para generar las ventas
	 * @returns valor de las ventas
	 */
	async getNetSales({ dateFinal, dateInitial, shopId }: DataGetNetSalesInput) {
		const finalDate = dayjs(dateFinal).add(1, 'd').format('YYYY/MM/DD');
		const initialDate = dayjs(dateInitial).format('YYYY/MM/DD');

		if (dayjs(finalDate).isBefore(dayjs(initialDate))) {
			throw new BadRequestException(
				'Error la fecha final debe ser igual o mayor a la fecha inicial',
			);
		}

		let shop;

		if (shopId) {
			shop = await this.shopsService.findById(shopId);
		}

		const aggregateSales = [
			{
				$match: {
					closeDate: {
						$gte: new Date(initialDate),
						$lt: new Date(finalDate),
					},
					'shop._id': shop?._id,
					status: StatusOrder.CLOSED,
				},
			},
			{
				$group: {
					_id: '',
					total: {
						$sum: '$summary.total',
					},
				},
			},
			{
				$project: {
					_id: 0,
					total: 1,
				},
			},
		];

		const sales = await this.orderModel.aggregate(aggregateSales);

		const aggregateCoupons = [
			{
				$unwind: '$payments',
			},
			{
				$match: {
					'payments.payment.type': 'bonus',
					closeDate: {
						$gte: new Date(initialDate),
						$lt: new Date(finalDate),
					},
					status: 'closed',
					'shop._id': shop?._id,
				},
			},
			{
				$group: {
					_id: ['$shop.name', '$payments.payment.type'],
					total: {
						$sum: '$payments.total',
					},
				},
			},
			{
				$project: {
					_id: 0,
					total: 1,
				},
			},
		];

		const totalCoupons = await this.orderModel.aggregate(aggregateCoupons);

		return (sales[0]?.total || 0) - (totalCoupons[0]?.total || 0);
	}

	/**
	 * @description se encarga de generar consolidado de medios de pago
	 * @param data datos necesarios para realizar la consulta
	 * @returns array de tipo #PaymentOrderClose
	 */
	async getPaymentsOrder({
		dateFinal,
		dateInitial,
		shopId,
	}: DataGetPaymentsOrderInput) {
		const finalDate = dayjs(dateFinal).format('YYYY/MM/DD');
		const initialDate = dayjs(dateInitial).format('YYYY/MM/DD');

		if (dayjs(finalDate).isBefore(dayjs(initialDate))) {
			throw new BadRequestException(
				'Error la fecha final debe ser igual o mayor a la fecha inicial',
			);
		}

		let shop;

		if (shopId) {
			shop = await this.shopsService.findById(shopId);
		}

		const aggreagtePayments = [
			{
				$unwind: '$payments',
			},
			{
				$match: {
					closeDate: {
						$gte: new Date(initialDate),
						$lt: new Date(dayjs(finalDate).add(1, 'd').format('YYYY/MM/DD')),
					},
					'shop._id': shop?._id,
					status: StatusOrder.CLOSED,
				},
			},
			{
				$group: {
					_id: '$payments.payment._id',
					value: {
						$sum: '$payments.total',
					},
					quantity: {
						$sum: 1,
					},
				},
			},
			{
				$project: {
					_id: 0,
					payment: '$_id',
					value: 1,
					quantity: 1,
				},
			},
		];

		return (await this.orderModel.aggregate(aggreagtePayments)) || [];
	}

	/*
	 * @description Se encarga de procesar los medios de pago
	 * @param payments medios de pago a procesar
	 * @param pointOfSale punto de venta que procesa los medios de pago
	 * @param order pedido que afectan los medios de pago
	 * @param user usuario que esta realizando la afectación
	 * @param companyId compañia a la que está afectando la operación
	 * @param customerId cliente para validar carteras
	 * @returns Array de métodos de pago ya procesados
	 */
	async proccessPayments(
		payments: PaymentOrder[],
		pointOfSale: PointOfSale,
		order: Order,
		user: User,
		companyId: string,
		customerId?: string,
	) {
		let coupon;
		const newPayments = [];

		//Se realizan validaciones
		for (let i = 0; i < payments?.length; i++) {
			const { payment, code, total, status } = payments[i];
			const statusPayment = StatusOrderDetail[status] || status;

			switch (payment.type) {
				case TypePayment.BONUS:
					if (!code) {
						throw new BadRequestException(
							'El medio de pago cupón debe tener código',
						);
					}

					if (statusPayment === StatusOrderDetail.CONFIRMED) {
						coupon = await this.couponsService.validateCoupon(
							code,
							user,
							companyId,
						);
					}

					if (statusPayment === StatusOrderDetail.NEW) {
						coupon = await this.couponsService.findOne(
							{
								code,
							},
							user,
							companyId,
						);
					}
					break;
				case TypePayment.CREDIT:
					if (statusPayment === StatusOrderDetail.CONFIRMED) {
						const credit = await this.creditsService.validateCredit(
							customerId,
							total,
							TypeCreditHistory.THAWED,
						);

						if (!credit) {
							throw new BadRequestException(
								'No se ha podido acreditar el pago, crédito con errores',
							);
						}
					}
					break;
				default:
					break;
			}
		}

		//se procesan los medios de pago
		for (let i = 0; i < payments?.length; i++) {
			const { payment, total, status, receipt } = payments[i];
			const statusPayment = StatusOrderDetail[status] || status;

			switch (payment.type) {
				case TypePayment.BONUS:
					if (statusPayment === StatusOrderDetail.CONFIRMED) {
						await this.couponsService.update(
							coupon._id.toString(),
							{
								status: StatusCoupon.REDEEMED,
							},
							user,
							companyId,
						);
						newPayments.push({
							...payments[i],
							status: StatusOrderDetail.CONFIRMED,
						});
					}

					if (statusPayment === StatusOrderDetail.NEW) {
						await this.couponsService.update(
							coupon._id.toString(),
							{
								status: StatusCoupon.ACTIVE,
							},
							user,
							companyId,
						);
						newPayments.push({
							...payments[i],
							status: StatusOrderDetail.NEW,
						});
					}

					break;
				case TypePayment.CREDIT:
					if (statusPayment === StatusOrderDetail.CONFIRMED) {
						await this.creditHistoryService.thawedCreditHistory(
							order.number,
							total,
							user,
							companyId,
						);
						await this.creditHistoryService.addCreditHistory(
							order.number,
							TypeDocument.ORDER,
							order?._id?.toString(),
							total,
							user,
							companyId,
						);

						newPayments.push({
							...payments[i],
							status: StatusOrderDetail.CONFIRMED,
						});
					}

					if (statusPayment === StatusOrderDetail.NEW) {
						await this.creditHistoryService.deleteCreditHistory(
							order.number,
							TypeDocument.ORDER,
							order?._id?.toString(),
							total,
							user,
							companyId,
						);

						await this.creditHistoryService.frozenCreditHistory(
							order.number,
							total,
							user,
							companyId,
						);

						newPayments.push({
							...payments[i],
							status: StatusOrderDetail.NEW,
						});
					}

					break;
				default:
					if (statusPayment === StatusOrderDetail.CONFIRMED) {
						const valuesReceipt = {
							value: total,
							paymentId: payment?._id?.toString(),
							pointOfSaleId: pointOfSale?._id?.toString(),
							concept: `Abono a pedido ${order?.number}`,
							isCredit: false,
							boxId:
								payment?.type === 'cash'
									? pointOfSale['box']?._id?.toString()
									: undefined,
						};

						const { receipt } = await this.receiptsService.create(
							valuesReceipt,
							user,
							companyId,
						);

						newPayments.push({
							...payments[i],
							status: StatusOrderDetail.CONFIRMED,
							receipt: receipt?._id,
						});
					}

					if (statusPayment === StatusOrderDetail.NEW) {
						//anular recibo de caja

						await this.receiptsService.update(
							receipt._id.toString(),
							{
								status: StatusReceipt.CANCELLED,
							},
							user,
							companyId,
							order?._id?.toString(),
						);

						newPayments.push({
							...payments[i],
							status: StatusOrderDetail.NEW,
						});
					}
					break;
			}
		}

		return newPayments;
	}
}

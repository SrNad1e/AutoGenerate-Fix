import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { FiltersReturnsOrderInput } from '../dtos/filters-returns-order';
import { ReturnOrder } from '../entities/return-order.entity';
import { User } from 'src/configurations/entities/user.entity';
import { CreateReturnOrderInput } from '../dtos/create-return-order-input';
import { DetailOrder, Order, StatusOrder } from '../entities/order.entity';
import { OrdersService } from './orders.service';
import { StockHistoryService } from 'src/inventories/services/stock-history.service';
import { CouponsService } from 'src/crm/services/coupons.service';
import { Coupon } from 'src/crm/entities/coupon.entity';
import { Shop } from 'src/configurations/entities/shop.entity';
import { DocumentTypeStockHistory } from 'src/inventories/dtos/create-stockHistory-input';

const populate = [
	{
		path: 'order',
		model: Order.name,
	},
	{
		path: 'coupon',
		model: Coupon.name,
	},
	{
		path: 'shop',
		model: Shop.name,
	},
];

@Injectable()
export class ReturnsOrderService {
	constructor(
		@InjectModel(ReturnOrder.name)
		private readonly returnOrderModel: PaginateModel<ReturnOrder>,
		private readonly ordersService: OrdersService,
		private readonly stockHistoryService: StockHistoryService,
		private readonly couponsService: CouponsService,
	) {}

	async findAll(
		{
			sort,
			active,
			limit = 10,
			page = 1,
			dateFinal,
			dateInitial,
			shopId,
			number,
		}: FiltersReturnsOrderInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<ReturnOrder> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (active !== undefined) {
			filters.active = active;
		}

		if (shopId) {
			filters.shop = new Types.ObjectId(shopId);
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

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.returnOrderModel.paginate(filters, options);
	}

	async create(
		{ details, orderId }: CreateReturnOrderInput,
		user: User,
		companyId: string,
	) {
		const { order } = await this.ordersService.findById(orderId);

		if (!order) {
			throw new BadRequestException('El pedido no existe');
		}

		if (order?.status !== StatusOrder.CLOSED) {
			throw new BadRequestException(
				'El pedido se encuentra cancelado o no se ha finalizado',
			);
		}

		if (!details || details?.length === 0) {
			throw new BadRequestException('La devolución no puede estar vacía');
		}

		const detailsReturn = [];
		let detailsOrder: DetailOrder[] = order?.details as DetailOrder[];

		for (let i = 0; i < details.length; i++) {
			const { productId, quantity } = details[i];

			const detail = order?.details?.find(
				(detail) => detail?.product?._id?.toString() === productId,
			);

			if (!detail) {
				throw new BadRequestException(
					`El producto ${productId} no existe en el pedido`,
				);
			}

			if (quantity === 0) {
				throw new BadRequestException(
					`No se puede crear una devolución con productos en 0, ${detail?.product?.reference['name']} / ${detail?.product?.barcode} `,
				);
			}

			if (quantity > detail?.quantity - detail?.quantityReturn) {
				throw new BadRequestException(
					`El pedido solo tiene ${
						detail?.quantity - detail?.quantityReturn
					} para el producto  ${detail?.product?.reference['name']} / ${
						detail?.product?.barcode
					}`,
				);
			}

			detailsOrder = detailsOrder.map((item) => {
				if (item?.product?._id.toString() === productId) {
					return {
						...item,
						quantityReturn: item.quantityReturn + quantity,
					};
				}

				return item;
			});

			detailsReturn.push({
				product: detail?.product,
				quantity,
				price: detail?.price,
			});
		}

		const coupon = await this.couponsService.create(
			{
				expiration: dayjs().add(30, 'd').toDate(),
				value: detailsReturn?.reduce(
					(sum, detail) => sum + detail?.price * detail?.quantity,
					0,
				),
				title: 'Cupón de Devolución',
				message:
					'Condiciones de uso:\n- Válido por 15 días para todas las compras\n- Válido para el portador\n- Redimible en todas las tiendas aliadas Toulouse\nPor protocolos de bioseguridad de COVID19\nninguna prenda tiene cambio',
			},
			user,
			companyId,
		);

		let number = 1;
		const lastReturn = await this.returnOrderModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			})
			.lean();

		if (lastReturn) {
			number = lastReturn.number + 1;
		}

		const responseReturnOrder = await this.returnOrderModel.create({
			number,
			company: new Types.ObjectId(companyId),
			order: order?._id,
			details: detailsReturn,
			shop: order?.shop?._id,
			coupon: coupon._id,
			user,
		});

		await this.ordersService.updateProducts(
			order?._id.toString(),
			detailsOrder,
		);

		await this.stockHistoryService.addStock(
			{
				details,
				warehouseId: order?.shop?.defaultWarehouse?._id?.toString(),
				documentId: responseReturnOrder?._id?.toString(),
				documentType: DocumentTypeStockHistory.RETURNORDER,
			},
			user,
			companyId,
		);

		return responseReturnOrder.populate(populate);
	}
}

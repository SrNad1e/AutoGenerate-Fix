import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import * as dayjs from 'dayjs';

import { User } from 'src/configurations/entities/user.entity';
import { StatusBoxHistory } from '../dtos/create-boxHistory.input';
import { CreateReceiptInput } from '../dtos/create-receipt.input';
import { FiltersReceiptsInput } from '../dtos/filters-receipts.input';
import { Box } from '../entities/box.entity';
import { Receipt, StatusReceipt } from '../entities/receipt.entity';
import { BoxHistoryService } from './box-history.service';
import { BoxService } from './box.service';
import { PaymentsService } from './payments.service';
import { UpdateReceiptInput } from '../dtos/update-receipt.input';
import { TypePayment } from '../entities/payment.entity';
import { CreditHistoryService } from 'src/credits/services/credit-history.service';
import { Order, StatusOrder } from 'src/sales/entities/order.entity';
import { CreditsService } from 'src/credits/services/credits.service';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';

const populate = [
	{
		path: 'box',
		model: Box.name,
	},
];

@Injectable()
export class ReceiptsService {
	constructor(
		@InjectModel(Receipt.name)
		private readonly receiptModel: PaginateModel<Receipt>,
		@InjectModel(PointOfSale.name)
		private readonly PointOfSaleModel: PaginateModel<PointOfSale>,
		@InjectModel(Order.name) private readonly orderModel: PaginateModel<Order>,
		private readonly boxService: BoxService,
		private readonly paymentsService: PaymentsService,
		private readonly boxHistoryService: BoxHistoryService,
		private readonly creditHistoryService: CreditHistoryService,
		private readonly creditsService: CreditsService,
	) {}

	async findAll(
		{
			dateFinal,
			dateInitial,
			limit = 10,
			page = 1,
			number,
			paymentId,
			sort,
			status,
			boxId,
			pointOfSaleId,
		}: FiltersReceiptsInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Receipt> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (number) {
			filters.number = number;
		}

		if (paymentId) {
			filters['payment._id'] = new Types.ObjectId(paymentId);
		}

		if (status) {
			filters.status = StatusReceipt[status] || status;
		}

		if (boxId) {
			filters.box = new Types.ObjectId(boxId);
		}

		if (pointOfSaleId) {
			filters.pointOfSale = new Types.ObjectId(pointOfSaleId);
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

		const options = {
			page,
			limit,
			sort,
			populate,
			lean: true,
		};

		return this.receiptModel.paginate(filters, options);
	}

	async create(
		{
			concept,
			paymentId,
			value,
			boxId,
			pointOfSaleId,
			details,
			isCredit = false,
		}: CreateReceiptInput,
		user: User,
		companyId: string,
	) {
		let box;

		if (boxId) {
			box = await this.boxService.findById(boxId);
			if (!box) {
				throw new NotFoundException('La caja no existe');
			}
		}

		let pointOfSale;

		if (pointOfSaleId) {
			pointOfSale = await this.PointOfSaleModel.findById(pointOfSaleId);
			if (!pointOfSale) {
				throw new NotFoundException('El punto de venta no existe');
			}
		}

		const payment = await this.paymentsService.findById(paymentId);

		if (!payment) {
			throw new NotFoundException('El medio de pago no existe');
		}

		if (details) {
			for (let i = 0; i < details.length; i++) {
				const { orderId } = details[i];
				const order = await this.orderModel.findById(orderId);

				if (!order) {
					throw new NotFoundException('Uno de los pedidos no existe');
				}
			}
		}

		const receipt = await this.receiptModel
			.findOne({ category: new Types.ObjectId(companyId) })
			.sort({ _id: -1 });

		const number = (receipt?.number || 0) + 1;

		const newReceipt = new this.receiptModel({
			number,
			value,
			concept,
			box: box?._id,
			isCredit,
			payment: payment,
			pointOfSale: pointOfSale._id,
			company: new Types.ObjectId(companyId),
			details,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		if (payment?.type === TypePayment.CASH) {
			await this.boxHistoryService.addCash(
				{
					boxId,
					documentId: newReceipt?._id.toString(),
					documentType: StatusBoxHistory.RECEIPT,
					value,
				},
				user,
				companyId,
			);
		}
		let creditHistory;

		if (details) {
			for (let i = 0; i < details.length; i++) {
				const { orderId, amount } = details[i];

				creditHistory = await this.creditHistoryService.deleteCreditHistory(
					orderId,
					amount,
					user,
					companyId,
				);
			}
		}

		const receiptNew = await (await newReceipt.save()).populate(populate);

		return {
			receipt: receiptNew['_doc'],
			credit: creditHistory?.credit,
		};
	}

	async update(
		id: string,
		{ status }: UpdateReceiptInput,
		user: User,
		companyId: string,
		orderId?: string,
	) {
		const receipt = await this.receiptModel.findById(id).lean();

		if (!receipt) {
			throw new BadRequestException(
				'El recibo que intenta actualizar no existe',
			);
		}

		if (
			receipt?.company.toString() !== companyId &&
			user.username !== 'admin'
		) {
			throw new UnauthorizedException(
				`El usuario no tiene permisos para actualizar este recibo`,
			);
		}

		if (StatusReceipt[status] === StatusReceipt.CANCELLED) {
			if (receipt?.details) {
				const ordersId = receipt.details.map(
					({ orderId }) => new Types.ObjectId(orderId),
				);
				const orders = await this.orderModel.find({
					_id: {
						$in: ordersId,
					},
				});

				if (orders.length === 0) {
					throw new Error(
						'Se ha presentado un error sin identificar, comunique al administrador',
					);
				}

				const credit = await this.creditsService.findOne({
					customerId: orders[0].customer?._id?.toString(),
				});

				if (!credit) {
					throw new NotFoundException(`El cliente no tiene cartera asignada`);
				}

				if (receipt.value > credit.available) {
					throw new BadRequestException(
						'El crédito no tiene suficiente cupo para anuar el recibo',
					);
				}

				for (let i = 0; i < receipt.details.length; i++) {
					const { orderId, amount } = receipt.details[i];

					await this.creditHistoryService.addCreditHistory(
						orderId,
						amount,
						user,
						companyId,
					);
				}

				if (receipt?.payment?.type === TypePayment.CASH) {
					await this.boxHistoryService.deleteCash(
						{
							boxId: receipt?.box.toString(),
							documentId: id,
							documentType: StatusBoxHistory.RECEIPT,
							value: receipt?.value,
						},
						user,
						companyId,
					);
				}
			} else if (orderId) {
				const order = await this.orderModel.findById(orderId).lean();

				if (!order) {
					throw new NotFoundException(`El pedido ${orderId} no existe`);
				}

				if (order?.status !== StatusOrder.PENDDING) {
					throw new BadRequestException(
						'No se puede cancelar el recibo, el pedido ya fue despachado',
					);
				}
			} else {
				throw new BadRequestException(
					'No se puede cancelar el recibo, debe suministrar un id de pedido',
				);
			}
		}

		return this.receiptModel.findByIdAndUpdate(id, {
			$set: {
				status: StatusReceipt[status] || status,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
		});
	}

	/**
	 * @description se encarga de consultar consolidado de créditos pagados
	 * @param dateInitial fecha inicial de la consulta
	 * @param dateFinal fecha final de la consulta
	 * @param pointOfSaleId punto de venta si se requiere para filtrar el valor
	 * @returns valor consolidado de los créditos pagados
	 */
	async getPaymentsCredit(
		dateInitial: string,
		dateFinal: string,
		pointOfSaleId?: string,
	) {
		const receiptsCredit = await this.receiptModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(dateInitial),
						$lt: new Date(dateFinal),
					},
					status: StatusReceipt.ACTIVE,
					pointOfSale: pointOfSaleId
						? new Types.ObjectId(pointOfSaleId)
						: undefined,
					isCredit: true,
				},
			},
			{
				$group: {
					_id: '$payment._id',
					value: {
						$sum: '$value',
					},
					quantity: {
						$sum: 1,
					},
				},
			},
			{
				$project: { _id: 0, value: 1, quantity: 1, payment: '$_id' },
			},
		]);

		return receiptsCredit;
	}

	/**
	 * @description se encarga de consultar consolidado de pagos generados
	 * @param dateInitial fecha inicial de la consulta
	 * @param dateFinal fecha final de la consulta
	 * @param pointOfSaleId punto de venta si se requiere para filtrar el valor
	 * @returns valor consolidado de los créditos pagados
	 */
	async getPaymentsNoCredit(
		dateInitial: string,
		dateFinal: string,
		pointOfSaleId?: string,
	) {
		const receiptsNoCredit = await this.receiptModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: new Date(dateInitial),
						$lt: new Date(dateFinal),
					},
					status: StatusReceipt.ACTIVE,
					pointOfSale: pointOfSaleId
						? new Types.ObjectId(pointOfSaleId)
						: undefined,
					isCredit: false,
				},
			},
			{
				$group: {
					_id: '$payment._id',
					value: {
						$sum: '$value',
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
		]);

		const paymentsCredit = await this.orderModel.aggregate([
			{
				$unwind: '$payments',
			},
			{
				$match: {
					closeDate: {
						$gte: new Date(dateInitial),
						$lt: new Date(dateFinal),
					},
					status: StatusOrder.CLOSED,
					pointOfSale: pointOfSaleId
						? new Types.ObjectId(pointOfSaleId)
						: undefined,
					'payments.payment.type': TypePayment.CREDIT,
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
		]);

		return [...receiptsNoCredit, ...paymentsCredit];
	}
}

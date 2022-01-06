import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { CouponsService } from 'src/coupons/services/coupons.service';
import { CreateRefundsDto, FiltersRefundsDto } from '../dtos/refunds.dto';
import { ProductReturns } from '../entities/productreturns.entity';
import { Refund } from '../entities/refund.entity';
import { OrdersService } from './orders.service';

//TODO: pendiente cambiar entidad
@Injectable()
export class RefundsService {
	constructor(
		@InjectModel(ProductReturns.name)
		private productReturnsModel: Model<ProductReturns>,
		private couponsService: CouponsService,
		private orderService: OrdersService,
	) {}

	async getAll(params: FiltersRefundsDto) {
		const filters: FilterQuery<Refund> = {};
		const {
			limit = 20,
			skip = 0,
			orderCode,
			invoiceNumber,
			shopId,
			sort,
		} = params;

		//TODO: pasar parametro a numero ya que el código es númerico
		if (orderCode) {
			filters['order.code'] = orderCode.toString();
		}

		//TODO: pasar parametro a numero ya que el número es númerico
		if (invoiceNumber) {
			filters.invoice.number = invoiceNumber.toString();
		}

		if (shopId) {
			filters.shop.shopId = shopId;
		}

		const result = await this.productReturnsModel
			.find(filters)
			.limit(limit)
			.skip(skip)
			.sort(sort)
			.exec();

		return {
			data: result,
			total: result?.length,
			limit,
			skip,
		};
	}

	//TODO: falta realizar validación de los productos con la factura
	async create(params: CreateRefundsDto) {
		const { products, order } = params;
		const amount = products.reduce(
			(sum, product) => sum + product.quantity + product.salePriceUnit,
			0,
		);
		const orderFind = await this.orderService.findById(order?.id);
		if (!orderFind) {
			return new NotFoundException(`Pedido No. ${order.code} no encontrado`);
		}
		const newRefund = new this.productReturnsModel({
			...params,
			amount,
			invoice: orderFind.invoice,
			order,
			shop: orderFind.shop,
		});
		let idRefound;
		try {
			const result = await newRefund.save();

			idRefound = result._id;

			const resultCoupon = await this.couponsService.create({
				...params,
				amount,
				order: orderFind,
				refund: result['_doc'],
				invoice: orderFind.invoice,
				shop: orderFind.shop,
				customer: orderFind['_doc'].customer,
			});
			return {
				...result['_doc'],
				coupon: resultCoupon['_doc'],
			};
		} catch (e: any) {
			//Si sucede un error en el proceso reversa todos los datos guardados en procesos anteriores
			if (idRefound) {
				await this.productReturnsModel.findByIdAndDelete(idRefound.toString());
			}
			return new NotFoundException(`Error al crear la devolición, ${e}`);
		}
	}
}

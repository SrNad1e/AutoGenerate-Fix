import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { CreateRefundsDto, FiltersRefundsDto } from '../dtos/refunds.dto';
import { ProductReturns } from '../entities/productreturns.entity';
import { Refund } from '../entities/refund.entity';

//TODO: pendiente cambiar entidad
@Injectable()
export class RefundsService {
	constructor(
		@InjectModel(ProductReturns.name)
		private productReturnsModel: Model<ProductReturns>,
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
	create(params: CreateRefundsDto) {
		const { products } = params;
		const amount = products.reduce(
			(sum, product) => sum + product.quantity + product.salePriceUnit,
			0,
		);
		const newRefund = new this.productReturnsModel({ ...params, amount });
		//Crear cupón y enviar objeto de devolución y cupón
		return newRefund.save();
	}
}

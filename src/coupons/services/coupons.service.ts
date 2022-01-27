/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as shortid from 'shortid';

import { CreateCouponsDto, FilterCouponsDto } from '../dtos/coupons.dto';
import { Coupon } from '../entities/coupon.entity';
@Injectable()
export class CouponsService {
	constructor(@InjectModel(Coupon.name) private couponModel: Model<Coupon>) {}

	async getAll(params: FilterCouponsDto) {
		const filters: FilterQuery<Coupon> = {};
		const {
			limit = 20,
			skip = 0,
			orderCode,
			invoiceNumber,
			shopId,
			couponCode,
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

		if (couponCode) {
			filters.couponCode = couponCode;
		}

		const result = await this.couponModel
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

	create(params: CreateCouponsDto) {
		shortid.characters(
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@',
		);
		const couponCode = shortid.generate();
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 30);
		const newCoupon = new this.couponModel({ ...params, couponCode, dueDate });

		return newCoupon.save();
	}
}

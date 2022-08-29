import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types, FilterQuery, _FilterQuery } from 'mongoose';
import * as shortid from 'shortid';

import { User } from 'src/configurations/entities/user.entity';
import { CreateCouponInput } from '../dtos/create-coupon.input';
import { FiltersCouponInput } from '../dtos/filters-coupon.input';
import { FiltersCouponsInput } from '../dtos/filters-coupons.input';
import { UpdateCouponInput } from '../dtos/update-coupon.input';
import { Coupon, StatusCoupon } from '../entities/coupon.entity';

@Injectable()
export class CouponsService {
	constructor(
		@InjectModel(Coupon.name)
		private readonly couponModel: PaginateModel<Coupon>,
	) {}

	async findAll(
		{ sort, code, limit = 10, number, page = 1, status }: FiltersCouponsInput,
		user: User,
		companyId: string,
	) {
		const filters: _FilterQuery<Coupon> = {};
		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (code) {
			filters.code = code;
		}

		if (number) {
			filters.number = number;
		}

		if (status) {
			filters.status = StatusCoupon[status];
		}

		const options = {
			sort,
			limit,
			page,
			lean: true,
		};

		return this.couponModel.paginate(filters, options);
	}

	async findOne({ code }: FiltersCouponInput, user: User, companyId: string) {
		const filters: FilterQuery<Coupon> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (code) {
			filters.code = code;
		}

		const response = await this.couponModel.findOne(filters).lean();

		if (!response) {
			throw new BadRequestException('El cupón no existe');
		}

		return response;
	}

	async create(
		{ expiration, message, title, value }: CreateCouponInput,
		user: User,
		companyId: string,
	) {
		let number = 1;
		const lastCoupon = await this.couponModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.sort({
				_id: -1,
			})
			.lean();

		if (lastCoupon) {
			number = lastCoupon.number + 1;
		}

		shortid.characters(
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@',
		);

		const code = shortid.generate();

		return this.couponModel.create({
			number,
			code,
			expiration,
			company: new Types.ObjectId(companyId),
			value,
			title,
			message,
			user,
		});
	}

	async update(
		id: string,
		{ status }: UpdateCouponInput,
		user: User,
		companyId: string,
	) {
		const coupon = await this.couponModel.findById(id);

		if (!coupon) {
			throw new BadRequestException(
				'El cupón que intenta actualizar no existe',
			);
		}

		if (
			coupon?.company?.toString() !== companyId &&
			user.username !== 'admin'
		) {
			throw new UnauthorizedException(
				'Usuario no tiene permisos para actualizar el cupón',
			);
		}

		if (coupon.status === StatusCoupon.REDEEMED) {
			throw new BadRequestException('El cupón ya fue redimido');
		}

		const response = await this.couponModel.findByIdAndUpdate(
			id,
			{
				$set: {
					status: StatusCoupon[status] || status,
					user,
				},
			},
			{
				lean: true,
				new: true,
			},
		);

		return response;
	}
}

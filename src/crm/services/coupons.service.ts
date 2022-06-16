import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types, FilterQuery } from 'mongoose';
import * as shortid from 'shortid';

import { User } from 'src/configurations/entities/user.entity';
import { CreateCouponInput } from '../dtos/create-coupon.input';
import { FiltersCouponInput } from '../dtos/filters-coupon.input';
import { UpdateCouponInput } from '../dtos/update-coupon.input';
import { Coupon, StatusCoupon } from '../entities/coupon.entity';

@Injectable()
export class CouponsService {
	constructor(
		@InjectModel(Coupon.name)
		private readonly couponModel: PaginateModel<Coupon>,
	) {}

	async findOne({ code }: FiltersCouponInput, user: User, companyId: string) {
		const filters: FilterQuery<Coupon> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (code) {
			filters.code = code;
		}

		return this.couponModel.findOne(filters).lean();
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

		if (coupon.company.toString() !== companyId && user.username !== 'admin') {
			throw new UnauthorizedException(
				'Usuario no tiene permisos para actualizar el cupón',
			);
		}

		if (coupon.status === StatusCoupon.REDEEMED) {
			throw new BadRequestException('El cupón ya fue redimido');
		}

		return this.couponModel.findByIdAndUpdate(id, {
			status: StatusCoupon[status],
			user,
		});
	}
}

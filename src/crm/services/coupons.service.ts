import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
	Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, Types, FilterQuery, _FilterQuery } from 'mongoose';
import * as dayjs from 'dayjs';
import * as shortid from 'shortid';

import { User } from 'src/configurations/entities/user.entity';
import { CreateCouponInput } from '../dtos/create-coupon.input';
import { FiltersCouponInput } from '../dtos/filters-coupon.input';
import { FiltersCouponsInput } from '../dtos/filters-coupons.input';
import { UpdateCouponInput } from '../dtos/update-coupon.input';
import { Coupon, StatusCoupon } from '../entities/coupon.entity';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class CouponsService {
	constructor(
		@InjectModel(Coupon.name)
		private readonly couponModel: PaginateModel<Coupon>,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	async findAll(
		{ sort, code, limit = 10, number, page = 1, status }: FiltersCouponsInput,
		user: User,
		companyId: string,
	) {
		const filters: _FilterQuery<Coupon> = {};
		if (user.username !== this.configService.USER_ADMIN) {
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

		if (user.username !== this.configService.USER_ADMIN) {
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
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});
	}

	async update(
		id: string,
		{ status }: UpdateCouponInput,
		user: User,
		companyId: string,
	) {
		const statusCoupon = StatusCoupon[status] || status;

		const coupon = await this.couponModel.findById(id);

		if (!coupon) {
			throw new BadRequestException(
				'El cupón que intenta actualizar no existe',
			);
		}

		if (
			coupon?.company?.toString() !== companyId &&
			user.username !== this.configService.USER_ADMIN
		) {
			throw new UnauthorizedException(
				'Usuario no tiene permisos para actualizar el cupón',
			);
		}

		if (
			coupon.status === StatusCoupon.REDEEMED &&
			statusCoupon === StatusCoupon.REDEEMED
		) {
			throw new BadRequestException('El cupón ya fue redimido');
		}

		const response = await this.couponModel.findByIdAndUpdate(
			id,
			{
				$set: {
					status: StatusCoupon[status] || status,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
				},
			},
			{
				lean: true,
				new: true,
			},
		);

		return response;
	}

	async validateCoupon(cuponCode: string, user: User, companyId: string) {
		const coupon = await this.findOne(
			{
				code: cuponCode,
				status: StatusCoupon.ACTIVE,
			},
			user,
			companyId,
		);

		if (!coupon) {
			throw new BadRequestException(
				'El cupón no existe o no puede usarse en esta factura',
			);
		}

		if (dayjs().isAfter(coupon?.expiration)) {
			throw new BadRequestException('El cupón ya se encuentra vencido');
		}

		return coupon;
	}
}

import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { Image } from 'src/configurations/entities/image.entity';
import { Shop } from 'src/configurations/entities/shop.entity';
import { User } from 'src/configurations/entities/user.entity';
import { CreatePaymentInput } from '../dtos/create-payment.input';

import { FiltersPaymentsInput } from '../dtos/filters-payments.input';
import { UpdatePaymentInput } from '../dtos/update-payment.input';
import { Payment, TypePayment } from '../entities/payment.entity';

const populate = [
	{
		path: 'logo',
		model: Image.name,
	},
	{
		path: 'shops',
		model: Shop.name,
	},
];

@Injectable()
export class PaymentsService {
	constructor(
		@InjectModel(Payment.name)
		private readonly paymentModel: PaginateModel<Payment>,
	) {}

	async findAll({
		active,
		limit = 10,
		name,
		shopId,
		page = 1,
		sort,
		type,
	}: FiltersPaymentsInput) {
		const filters: FilterQuery<Payment> = {};

		if (active !== undefined) {
			filters.active = active;
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (type) {
			filters.type = type;
		}

		if (shopId) {
			filters.shops = {
				$in: [new Types.ObjectId(shopId)],
			};
		}

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.paymentModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.paymentModel.findById(id).lean();
	}

	async create(
		{ type, name, logoId, shopIds, ...params }: CreatePaymentInput,
		user: User,
	) {
		const payment = await this.paymentModel.findOne({ name });

		if (payment) {
			throw new BadGatewayException(
				'El método de pago ya se encuentra registrado',
			);
		}

		const shops = shopIds.map((shopId) => new Types.ObjectId(shopId));

		return this.paymentModel.create({
			type: TypePayment[type],
			logo: new Types.ObjectId(logoId),
			name,
			shops,
			...params,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});
	}

	async update(
		id: string,
		{ type, logoId, shopIds, ...params }: UpdatePaymentInput,
		user: User,
	) {
		const payment = await this.findById(id);

		if (!payment) {
			throw new BadGatewayException('El método de pago');
		}

		const shops = shopIds?.map((shopId) => new Types.ObjectId(shopId));

		return this.paymentModel.findByIdAndUpdate(
			id,
			{
				type: TypePayment[type],
				logo: new Types.ObjectId(logoId),
				shops,
				...params,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
			{
				lean: true,
				new: true,
			},
		);
	}
}

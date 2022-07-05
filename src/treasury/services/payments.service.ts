import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { CreatePaymentInput } from '../dtos/create-payment.input';

import { FiltersPaymentsInput } from '../dtos/filters-payments.input';
import { UpdatePaymentInput } from '../dtos/update-payment.input';
import { Payment, TypePayment } from '../entities/payment.entity';

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

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.paymentModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.paymentModel.findById(id).lean();
	}

	async create({ type, name, ...params }: CreatePaymentInput, user: User) {
		const payment = await this.paymentModel.findOne({ name });

		if (payment) {
			throw new BadGatewayException(
				'El método de pago ya se encuentra registrado',
			);
		}

		return this.paymentModel.create({
			type: TypePayment[type],
			name,
			...params,
			user,
		});
	}

	async update(
		id: string,
		{ type, ...params }: UpdatePaymentInput,
		user: User,
	) {
		const payment = await this.findById(id);

		if (!payment) {
			throw new BadGatewayException('El método de pago');
		}

		return this.paymentModel.findByIdAndUpdate(
			id,
			{
				type: TypePayment[type],
				...params,
				user,
			},
			{
				lean: true,
				new: true,
			},
		);
	}
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregatePaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Customer } from 'src/crm/entities/customer.entity';
import { UpdateCreditInput } from '../dtos/update-credit.input';
import { TypeCreditHistory } from '../entities/credit-history.entity';
import { Credit, StatusCredit } from '../entities/credit.entity';

const populate = [
	{
		path: 'customer',
		model: Customer.name,
	},
];

@Injectable()
export class CreditsService {
	constructor(
		@InjectModel(Credit.name)
		private readonly creditModel: AggregatePaginateModel<Credit>,
	) {}

	async update(
		id: string,
		{ detailAddCredit, status, amount }: UpdateCreditInput,
		user: User,
	) {
		const credit = await this.creditModel.findById(id).populate(populate);

		if (!credit) {
			throw new BadRequestException(
				'El crédito que intentas actualizar no es válido',
			);
		}

		if (detailAddCredit && credit?.status !== StatusCredit.ACTIVE) {
			throw new BadRequestException(
				`El crédito para el cliente ${credit?.customer['firstName']} ${credit?.customer['lastname']} no se encuentra activo`,
			);
		}

		let available = credit?.available || 0;
		let balance = credit?.balance || 0;
		let frozenAmount = credit?.frozenAmount || 0;
		let details = [...credit?.details];

		if (detailAddCredit) {
			switch (detailAddCredit?.type) {
				case TypeCreditHistory.CREDIT:
					if (detailAddCredit?.total > available) {
						throw new BadRequestException(
							`El crédito del cliente no tiene cupo disponible, cupo $ ${available}`,
						);
					}
					available = available - detailAddCredit?.total;
					balance = balance + detailAddCredit?.total;
					details.push({
						orderId: new Types.ObjectId(detailAddCredit?.orderId),
						balance: detailAddCredit?.total,
						total: detailAddCredit?.total,
					});
					break;
				case TypeCreditHistory.DEBIT:
					if (detailAddCredit?.total > balance) {
						throw new BadRequestException(
							`Saldo pendiente menor al pago, saldo $ ${balance}`,
						);
					}
					available = available + detailAddCredit?.total;
					balance = balance - detailAddCredit?.total;
					const newDetails = details.map((detail) => {
						if (detail.orderId.toString() === detailAddCredit.orderId) {
							return {
								...detail,
								balance: detail.balance - detailAddCredit?.total,
							};
						}
						return detail;
					});

					details = newDetails.filter((detail) => detail.total > 0);
					break;
				case TypeCreditHistory.FROZEN:
					if (detailAddCredit?.total > available) {
						throw new BadRequestException(
							`El crédito del cliente no tiene cupo disponible, cupo $ ${available}`,
						);
					}
					available = available - detailAddCredit?.total;
					frozenAmount = frozenAmount + detailAddCredit?.total;
					break;
				case TypeCreditHistory.THAWED:
					if (detailAddCredit?.total > frozenAmount) {
						throw new BadRequestException(
							`El crédito del cliente no tiene cupo congelado disponible para liberar, cupo $ ${frozenAmount}`,
						);
					}
					available = available - detailAddCredit?.total;
					frozenAmount = frozenAmount - detailAddCredit?.total;
					break;
				default:
					break;
			}
		}

		return this.creditModel.findByIdAndUpdate(
			id,
			{
				$set: {
					status,
					amount,
					available,
					balance,
					frozenAmount,
					details,
					user,
				},
			},
			{
				lean: true,
				populate,
				new: true,
			},
		);
	}

	async validateCredit(
		customerId: string,
		amount: number,
		type: TypeCreditHistory,
	) {
		switch (type) {
			case TypeCreditHistory.CREDIT || TypeCreditHistory.FROZEN:
				return this.creditModel.findOne({
					customer: new Types.ObjectId(customerId),
					available: {
						$gte: amount,
					},
				});
			case TypeCreditHistory.DEBIT:
				return this.creditModel.findOne({
					customer: new Types.ObjectId(customerId),
					balance: {
						$gte: amount,
					},
				});
			case TypeCreditHistory.THAWED:
				return this.creditModel.findOne({
					customer: new Types.ObjectId(customerId),
					frozenAmount: {
						$gte: amount,
					},
				});

			default:
				break;
		}
	}
}

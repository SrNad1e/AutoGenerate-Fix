import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	AggregatePaginateModel,
	FilterQuery,
	PaginateModel,
	Types,
} from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Customer } from 'src/crm/entities/customer.entity';
import { CustomersService } from 'src/crm/services/customers.service';
import { Order } from 'src/sales/entities/order.entity';
import { CreateCreditInput } from '../dtos/create-credit.input';
import { FiltersCreditInput } from '../dtos/filters-credit.input';
import { FiltersCreditsInput } from '../dtos/filters-credits.input';
import { UpdateCreditInput } from '../dtos/update-credit.input';
import { TypeCreditHistory } from '../entities/credit-history.entity';
import { Credit, StatusCredit } from '../entities/credit.entity';

const populate = [
	{
		path: 'customer',
		model: Customer.name,
	},
	{
		path: 'details',
		populate: {
			path: 'order',
			model: Order.name,
		},
	},
];

@Injectable()
export class CreditsService {
	constructor(
		@InjectModel(Credit.name)
		private readonly creditModel: AggregatePaginateModel<Credit> &
			PaginateModel<Credit>,
		private readonly customersService: CustomersService,
	) {}

	async findAll(
		{
			amount,
			customerId,
			limit = 10,
			page = 1,
			sort,
			status,
		}: FiltersCreditsInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Credit> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (amount) {
			filters.amount = amount;
		}

		if (customerId) {
			filters.customer = new Types.ObjectId(customerId);
		}

		if (status) {
			filters.status = StatusCredit[status];
		}

		const options = {
			limit,
			populate,
			lean: true,
			page,
			sort,
		};

		return this.creditModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.creditModel.findById(id).populate(populate).lean();
	}

	async findOne({ customerId }: FiltersCreditInput) {
		const filters: FilterQuery<Credit> = {};

		if (customerId) {
			filters.customer = new Types.ObjectId(customerId);
		}
		const response = await this.creditModel
			.findOne(filters)
			.populate(populate)
			.lean();

		if (!response) {
			throw new BadRequestException('El usuario no tiene crédito');
		}
		return response;
	}

	async create(
		{ amount, customerId }: CreateCreditInput,
		user: User,
		companyId: string,
	) {
		const customer = await this.customersService.findById(customerId);
		if (!customer) {
			throw new BadRequestException('El cliente no existe');
		}

		return (
			await this.creditModel.create({
				customer: customer._id,
				amount,
				company: new Types.ObjectId(companyId),
				available: amount,
				user,
			})
		).populate(populate);
	}

	async update(
		id: string,
		{ detailAddCredit, status, amount }: UpdateCreditInput,
		user: User,
		companyId: string,
	) {
		const credit = await this.creditModel.findById(id).populate(populate);

		if (!credit) {
			throw new BadRequestException(
				'El crédito que intentas actualizar no es válido',
			);
		}

		if (credit?.company.toString() !== companyId) {
			throw new UnauthorizedException(
				'El usuario no tiene permisos para hacer cambios en este crédito',
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
						order: new Types.ObjectId(detailAddCredit?.orderId),
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
						if (detail.order?._id?.toString() === detailAddCredit.orderId) {
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
					status: StatusCredit[status],
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

	/**
	 * @description valida el monto que dependiendo del proceso
	 * @param customerId cliente al que pertenece el crédito
	 * @param amount valor del movimiento
	 * @param type tipo de movimiento
	 * @returns crédito del cliente o null
	 */
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

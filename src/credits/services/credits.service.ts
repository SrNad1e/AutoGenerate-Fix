import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregatePaginateModel } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Customer } from 'src/crm/entities/customer.entity';
import { UpdateCreditInput } from '../dtos/update-credit.input';
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
		{ detailAddCredit, status }: UpdateCreditInput,
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

		if (detailAddCredit) {
			//validar el tipo
			//si es credit sumar al saldo
			//si es debit restar al saldo
			//si es frozen congelar el crédito
			//si es thawed descongelar el saldo
		}
	}
}

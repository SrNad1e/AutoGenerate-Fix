import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AggregatePaginateModel } from 'mongoose';
import { CreditHistory } from '../entities/credit-history.entity';
import { CreditsService } from './credits.service';

@Injectable()
export class CreditHistoryService {
	constructor(
		@InjectModel(CreditHistory.name)
		private readonly creditHistoryModel: AggregatePaginateModel<CreditHistory>,
		private readonly creditsService: CreditsService,
	) {}

	async addCreditHistory() {
		//validar monto disponible
		//actualizar la cartera
		//crear el registro
	}

	async deleteCreditHistory() {
		//validar monto para debitar
		//actualiar la cartera
		//crear el registro
	}

	async frozenCreditHistory() {
		//validar monto a congelar
		//actualiar la cartera
		//crear el registro
	}

	async thawedCreditHistory() {
		//validar monto a descongelar
		//actualiar la cartera
		//crear el registro
	}
}

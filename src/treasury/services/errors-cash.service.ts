import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { CloseZInvoicing } from 'src/sales/entities/close-z-invoicing.entity';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';
import { CreateErrorCashInput } from '../dtos/create-errorCash.input';
import { Box } from '../entities/box.entity';
import { ErrorCash, TypeErrorCash } from '../entities/error-cash.entity';
import { BoxService } from './box.service';

const populate = [
	{
		path: 'boxOrigin',
		model: Box.name,
	},
	{
		path: 'boxDestination',
		model: Box.name,
	},
	{
		path: 'closeZ',
		model: CloseZInvoicing.name,
	},
];

@Injectable()
export class ErrorsCashService {
	constructor(
		@InjectModel(ErrorCash.name)
		private readonly errorCashModel: PaginateModel<ErrorCash>,
		@InjectModel(CloseZInvoicing.name)
		private readonly closeZInvoicingModel: PaginateModel<CloseZInvoicing>,
		private readonly boxesService: BoxService,
	) {}

	async addRegister(
		{ closeZId, value, typeError }: CreateErrorCashInput,
		user: User,
		companyId: string,
	) {
		const newTypeError = TypeErrorCash[typeError] || typeError;

		const closeZ = await this.closeZInvoicingModel
			.findById(closeZId)
			.populate([
				{
					path: 'pointOfSale',
					model: PointOfSale.name,
				},
			])
			.lean();

		const boxMain = await this.boxesService.findOne(
			{
				isMain: true,
			},
			companyId,
		);

		if (!closeZ) {
			throw new BadRequestException('El cierre no existe');
		}

		if (value <= 0) {
			throw new BadRequestException(
				'El valor del error no puede ser menor o igual que 0',
			);
		}

		return this.errorCashModel.create({
			boxOrigin: closeZ.pointOfSale['box'],
			boxDestination: boxMain._id,
			closeZ: closeZ._id,
			typeError: newTypeError,
			user,
		});
	}
}
